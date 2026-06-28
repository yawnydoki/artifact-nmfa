import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { QRCodeSVG } from "qrcode.react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content");

  const [artworks, setArtworks] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const [currentDailyHash, setCurrentDailyHash] = useState("");
  const [isGeneratingHash, setIsGeneratingHash] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("content");
  const [editItem, setEditItem] = useState(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [translateLang, setTranslateLang] = useState("tag");

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  useEffect(() => {
    if (activeTab === "feedback") {
      fetchFeedback();
    } else if (activeTab === "gatepass") {
      fetchTodayGatepass();
    } else {
      fetchArtworks();
    }
    setCurrentPage(1);
  }, [activeTab]);

  const fetchArtworks = async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .order("target_index", { ascending: true });

    if (error) console.error("Error fetching artworks:", error.message);
    else setArtworks(data || []);
    setIsLoadingData(false);
  };

  const fetchFeedback = async () => {
    setIsLoadingFeedback(true);
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching feedback:", error.message);
    else setFeedback(data || []);
    setIsLoadingFeedback(false);
  };

  const fetchTodayGatepass = async () => {
    const today = new Date().toLocaleDateString("en-CA");
    try {
      const { data, error } = await supabase
        .from("daily_gatepass")
        .select("token_hash")
        .eq("valid_date", today)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCurrentDailyHash(data.token_hash);
      } else {
        setCurrentDailyHash("");
      }
    } catch (err) {
      console.error("Error fetching today's gatepass:", err.message);
    }
  };

  const handleRecompileAR = async () => {
    setIsCompiling(true);
    setCompileProgress(0);

    try {
      const { data: activeArtworks, error: fetchError } = await supabase
        .from("artworks")
        .select("thumbnail_url")
        .not("thumbnail_url", "is", null)
        .order("target_index", { ascending: true });
      console.log(activeArtworks);
      console.log("Images:", activeArtworks.length);

      if (fetchError) throw fetchError;
      if (!activeArtworks || activeArtworks.length === 0) {
        alert("No artworks with thumbnails found to compile.");
        setIsCompiling(false);
        return;
      }

      const loadedImages = await Promise.all(
        activeArtworks.map((art) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () =>
              reject(
                new Error(`Failed to load target image: ${art.thumbnail_url}`),
              );
            img.src = art.thumbnail_url;
          });
        }),
      );

      if (
        !window.MINDAR ||
        !window.MINDAR.IMAGE ||
        !window.MINDAR.IMAGE.Compiler
      ) {
        throw new Error(
          "MindAR core compiler library script failed to load into index.html.",
        );
      }

      const compiler = new window.MINDAR.IMAGE.Compiler();

      console.log("Artworks fetched:", activeArtworks.length);
      console.log(activeArtworks);
      console.log("Images loaded:", loadedImages.length);
      await compiler.compileImageTargets(loadedImages, (progress) => {
        setCompileProgress(Math.round(progress));
      });

      const exportedBuffer = await compiler.exportData();

      const { error: uploadError } = await supabase.storage
        .from("ar-assets")
        .upload("targets.mind", exportedBuffer, {
          upsert: true,
          contentType: "application/octet-stream",
        });

      if (uploadError) throw uploadError;

      alert(
        "Success! The AR tracking database has been compiled and uploaded to the cloud.",
      );
    } catch (err) {
      console.error("AR Target Compilation Failure Traces:", err);
      alert("Failed to build AR tracking database: " + err.message);
    } finally {
      setIsCompiling(false);
      setCompileProgress(0);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `paintings/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("art-thumbnails")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("art-thumbnails")
        .getPublicUrl(filePath);

      setEditItem((prev) => ({
        ...prev,
        thumbnail_url: publicUrlData.publicUrl,
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading image to cloud: " + error.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleGenerateGatepass = async () => {
    setIsGeneratingHash(true);
    const today = new Date().toLocaleDateString("en-CA");
    const newSecureHash = crypto.randomUUID();

    try {
      const { data: existingPass, error: fetchError } = await supabase
        .from("daily_gatepass")
        .select("id")
        .eq("valid_date", today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let resultError;

      if (existingPass) {
        const { error } = await supabase
          .from("daily_gatepass")
          .update({ token_hash: newSecureHash })
          .eq("id", existingPass.id);
        resultError = error;
      } else {
        const { error } = await supabase
          .from("daily_gatepass")
          .insert([{ valid_date: today, token_hash: newSecureHash }]);
        resultError = error;
      }

      if (resultError) throw resultError;

      setCurrentDailyHash(newSecureHash);
      alert("Success! New Museum QR Gatepass generated for today.");
    } catch (err) {
      console.error("Failed to generate token:", err.message);
      alert("Error generating gatepass code: " + err.message);
    } finally {
      setIsGeneratingHash(false);
    }
  };

  const openEditModal = (item, mode) => {
    setEditItem(JSON.parse(JSON.stringify(item)));
    setModalMode(mode);
    setIsNewItem(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
    setIsNewItem(false);
  };

  const handleJsonChange = (column, lang, value) => {
    setEditItem((prev) => ({
      ...prev,
      [column]: {
        ...(prev[column] || {}),
        [lang]: value,
      },
    }));
  };

  const handleQuizChange = (qNum, lang, field, value, choiceIndex = null) => {
    setEditItem((prev) => {
      const qData = prev[qNum] || {};
      const langData = qData[lang] || {
        question: "",
        choices: ["", "", "", ""],
        correct_index: 0,
      };

      if (field === "choices") {
        const newChoices = [...langData.choices];
        newChoices[choiceIndex] = value;
        return {
          ...prev,
          [qNum]: { ...qData, [lang]: { ...langData, choices: newChoices } },
        };
      } else {
        return {
          ...prev,
          [qNum]: { ...qData, [lang]: { ...langData, [field]: value } },
        };
      }
    });
  };
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this painting? This action cannot be undone.",
      )
    )
      return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", editItem.id);

      if (error) throw error;

      setArtworks(artworks.filter((a) => a.id !== editItem.id));
      alert("Painting deleted successfully.");
      closeModal();
    } catch (error) {
      console.error("Error deleting:", error.message);
      alert("Failed to delete painting: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      if (isNewItem) {
        const { data: highestTarget, error: highestError } = await supabase
          .from("artworks")
          .select("target_index")
          .order("target_index", { ascending: false })
          .limit(1)
          .single();

        if (highestError && highestError.code !== "PGRST116") {
          throw highestError;
        }

        const nextTargetIndex =
          highestTarget?.target_index != null
            ? highestTarget.target_index + 1
            : 0;

        const dataToSave = {
          ...editItem,
          target_index: nextTargetIndex,
        };

        delete dataToSave.id;

        if (!dataToSave.thumbnail_url) {
          dataToSave.thumbnail_url = null;
        }

        const { data, error } = await supabase
          .from("artworks")
          .insert([dataToSave])
          .select();

        if (error) throw error;

        setArtworks([...artworks, data[0]]);
        alert("New painting created successfully!");
      }

      closeModal();
    } catch (error) {
      console.error("Error saving:", error.message);
      alert("Failed to save changes: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "content", label: "Painting Content" },
    { id: "translations", label: "Translations" },
    { id: "quizzes", label: "Quizzes" },
    { id: "feedback", label: "Visitor Feedback" },
    { id: "gatepass", label: "Daily Gatepass" },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = activeTab === "feedback" ? feedback : artworks;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const hasTranslation = (obj, lang) => {
    const exists = obj && obj[lang] && String(obj[lang]).trim() !== "";
    return exists ? (
      <span className="bg-[#4A260F] text-[#E0CCB6] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
        Done
      </span>
    ) : (
      <span className="bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
        Needs Entry
      </span>
    );
  };

  const inputStyles =
    "p-2 rounded border border-[#381111]/30 w-full bg-white text-[#381111] focus:outline-none focus:ring-2 focus:ring-[#E19B2D]";

  const LogoIcon = ({ customClass = "mb-4 w-20 h-20" }) => (
    <img
      src="/logo_trans.png"
      alt="ArtiFact Logo"
      className={`${customClass} drop-shadow-md object-contain`}
    />
  );

  return (
    <div className="min-h-[100dvh] w-screen bg-[#F5EAD4] font-sans flex flex-col md:flex-row relative">
      <div className="w-full md:w-64 bg-[#381111] text-[#E0CCB6] flex flex-col shadow-xl flex-shrink-0 z-20">
        <div className="p-6 border-b border-white/10">
          <LogoIcon customClass="w-60 h-10" />
          <h1 className="font-serif text-2xl font-bold tracking-wide mt-1 mb-1">
            ArtiFact Admin
          </h1>
          <p className="text-sm opacity-70 font-neohellenic mt-1">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 flex md:flex-col overflow-x-auto md:overflow-x-hidden p-4 gap-2 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex justify-between items-center flex-shrink-0 text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#E0CCB6] text-[#381111] shadow-md"
                  : "hover:bg-white/10 text-[#E0CCB6]/80 hover:text-white"
              }`}
            >
              {tab.label}
              <span className="font-bold">&gt;</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex text-left gap-2 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/30 transition-colors font-medium"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto h-[100dvh]">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <h2 className="font-serif text-4xl text-[#381111] mb-8 border-b-2 border-[#381111]/10 pb-4 flex-shrink-0">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>

          {activeTab === "content" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#4A260F]/10 flex flex-col flex-1 min-h-0">
              <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-[#F5EAD4]/50 p-4 rounded-xl border border-[#381111]/10 gap-4">
                <div>
                  <h3 className="font-bold text-[#381111] text-lg">
                    AR Target Database
                  </h3>
                  <p className="text-sm text-gray-600">
                    Recompile the computer vision matrix if you have added or
                    updated painting images.
                  </p>
                </div>

                <div className="flex flex-col w-full md:w-auto items-end gap-2">
                  <button
                    onClick={handleRecompileAR}
                    disabled={isCompiling}
                    className="px-6 py-2 bg-[#E19B2D] text-white font-bold rounded-lg shadow-sm hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    {isCompiling
                      ? "Compiling Matrix..."
                      : "Rebuild AR Scanner File"}
                  </button>
                  {isCompiling && (
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#E19B2D] transition-all duration-300"
                        style={{ width: `${compileProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <button
                  onClick={() => {
                    setEditItem({ title: {}, artist: {}, clues: {} });
                    setModalMode("content");
                    setIsNewItem(true);
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-2 bg-[#381111] text-[#E0CCB6] font-bold rounded-lg shadow-sm hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add New Painting
                </button>
              </div>

              {isLoadingData ? (
                <div className="w-full py-12 flex justify-center text-[#4A260F] animate-pulse">
                  Loading database records...
                </div>
              ) : (
                <div className="overflow-auto flex-1 rounded-xl border border-gray-200 hide-scrollbar shadow-inner relative">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-[#E0CCB6] z-10 shadow-sm">
                      <tr className="text-[#4A260F] text-sm uppercase tracking-wider">
                        <th className="p-4 border-b border-gray-300 font-bold">
                          ID (AR Target)
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Image
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Title (EN)
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Artist
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Zone
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {currentItems.map((art) => (
                        <tr
                          key={art.id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="p-4 border-b border-gray-100 text-gray-500 font-bold">
                            {art.id}
                          </td>
                          <td className="p-4 border-b border-gray-100">
                            {art.thumbnail_url ? (
                              <img
                                src={art.thumbnail_url}
                                alt="thumb"
                                className="w-12 h-12 rounded object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                N/A
                              </div>
                            )}
                          </td>
                          <td className="p-4 border-b border-gray-100 font-serif font-bold text-[#381111]">
                            {art.title?.eng || "Untitled"}
                          </td>
                          <td className="p-4 border-b border-gray-100 text-gray-600">
                            {art.artist?.eng || "Unknown"}{" "}
                            {art.artist_year ? `(${art.artist_year})` : ""}
                          </td>
                          <td className="p-4 border-b border-gray-100">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                              Zone {art.zone || "?"}
                            </span>
                          </td>
                          <td className="p-4 border-b border-gray-100 text-right">
                            <button
                              onClick={() => openEditModal(art, "content")}
                              className="text-[#4A260F] hover:text-[#E19B2D] font-medium transition-colors px-3 py-1 bg-white border border-gray-200 rounded shadow-sm"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "translations" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#4A260F]/10 flex flex-col flex-1 min-h-0">
              {isLoadingData ? (
                <div className="w-full py-12 flex justify-center text-[#4A260F] animate-pulse">
                  Loading data...
                </div>
              ) : (
                <div className="overflow-auto flex-1 rounded-xl border border-gray-200 hide-scrollbar shadow-inner relative">
                  <table className="w-full text-center border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-[#E0CCB6] z-10 shadow-sm">
                      <tr className="text-[#4A260F] text-sm uppercase tracking-wider">
                        <th className="p-4 border-b border-gray-300 font-bold text-left">
                          Artwork (EN)
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Tagalog
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Chinese
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Japanese
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Korean
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {currentItems.map((art) => (
                        <tr
                          key={art.id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="p-4 border-b border-gray-100 font-serif font-bold text-[#381111] text-left">
                            {art.title?.eng || "Untitled"}
                          </td>
                          <td className="p-4 border-b border-gray-100">
                            {hasTranslation(art.title, "tag")}
                          </td>
                          <td className="p-4 border-b border-gray-100">
                            {hasTranslation(art.title, "chi")}
                          </td>
                          <td className="p-4 border-b border-gray-100">
                            {hasTranslation(art.title, "jap")}
                          </td>
                          <td className="p-4 border-b border-gray-100">
                            {hasTranslation(art.title, "kor")}
                          </td>
                          <td className="p-4 border-b border-gray-100 text-right">
                            <button
                              onClick={() => openEditModal(art, "translations")}
                              className="text-[#4A260F] hover:text-[#E19B2D] font-medium transition-colors px-3 py-1 bg-white border border-gray-200 rounded shadow-sm"
                            >
                              Translate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#4A260F]/10 flex flex-col flex-1 min-h-0">
              {isLoadingData ? (
                <div className="w-full py-12 flex justify-center text-[#4A260F] animate-pulse">
                  Loading data...
                </div>
              ) : (
                <div className="overflow-auto flex-1 rounded-xl border border-gray-200 hide-scrollbar shadow-inner relative">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-[#E0CCB6] z-10 shadow-sm">
                      <tr className="text-[#4A260F] text-sm uppercase tracking-wider">
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Artwork (EN)
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold text-center">
                          Questions Set
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Sample Q1 (EN)
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {currentItems.map((art) => {
                        const questionsSet = [
                          art.q1,
                          art.q2,
                          art.q3,
                          art.q4,
                          art.q5,
                        ].filter((q) => q && q.eng && q.eng.question).length;
                        return (
                          <tr
                            key={art.id}
                            className="hover:bg-gray-50 transition-colors group"
                          >
                            <td className="p-4 border-b border-gray-100 font-serif font-bold text-[#381111]">
                              {art.title?.eng || "Untitled"}
                            </td>
                            <td className="p-4 border-b border-gray-100 text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm ${questionsSet === 5 ? "bg-[#4A260F] text-[#E0CCB6]" : "bg-white text-[#4A260F]/40 border border-[#4A260F]/20"}`}
                              >
                                {questionsSet} / 5
                              </span>
                            </td>
                            <td className="p-4 border-b border-gray-100 text-gray-600 truncate max-w-xs">
                              {art.q1?.eng?.question || "No question provided"}
                            </td>
                            <td className="p-4 border-b border-gray-100 text-right">
                              <button
                                onClick={() => openEditModal(art, "quizzes")}
                                className="text-[#4A260F] hover:text-[#E19B2D] font-medium transition-colors px-3 py-1 bg-white border border-gray-200 rounded shadow-sm"
                              >
                                Edit Quiz
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#4A260F]/10 flex flex-col flex-1 min-h-0">
              {isLoadingFeedback ? (
                <div className="w-full py-12 flex justify-center text-[#4A260F] animate-pulse">
                  Loading feedback...
                </div>
              ) : (
                <div className="overflow-auto flex-1 rounded-xl border border-gray-200 hide-scrollbar shadow-inner relative">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-[#E0CCB6] z-10 shadow-sm">
                      <tr className="text-[#4A260F] text-sm uppercase tracking-wider">
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Date
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Visitor ID
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Rating
                        </th>
                        <th className="p-4 border-b border-gray-300 font-bold">
                          Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {currentItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 border-b border-gray-100 text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 border-b border-gray-100 font-mono text-xs text-gray-400">
                            {item.visitor_id || "Anonymous"}
                          </td>
                          <td className="p-4 border-b border-gray-100 font-bold text-yellow-500">
                            {item.rating ? `${item.rating} / 5` : "N/A"}
                          </td>
                          <td className="p-4 border-b border-gray-100 text-gray-600">
                            {item.comments || "No comment provided."}
                          </td>
                        </tr>
                      ))}
                      {currentItems.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-8 text-center text-gray-500 italic"
                          >
                            No feedback entries yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "gatepass" && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#4A260F]/10 flex flex-col items-center justify-center flex-1 min-h-0 text-center">
              <h3 className="font-serif text-3xl text-[#381111] mb-2">
                Daily Reception Desk Token
              </h3>
              <p className="text-gray-500 max-w-md mb-8 text-sm">
                Generate the unique verification payload string for today.
                Visitors must scan this code using their mobile cameras to
                activate app features inside the venue.
              </p>

              <button
                onClick={handleGenerateGatepass}
                disabled={isGeneratingHash}
                className="mb-8 px-8 py-3 bg-[#381111] text-[#E0CCB6] font-serif font-bold text-lg rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                {isGeneratingHash
                  ? "Generating Secure Link..."
                  : "Generate Today's Active QR Code"}
              </button>

              {currentDailyHash ? (
                <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                  <div className="text-xs bg-[#4A260F] text-[#E0CCB6] px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">
                    Active Pass Date: {new Date().toLocaleDateString("en-CA")}
                  </div>

                  <div className="p-6 border-4 border-[#381111] rounded-2xl inline-block bg-white shadow-xl">
                    <QRCodeSVG
                      value={currentDailyHash.trim()}
                      size={240}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <p className="text-sm font-serif italic text-gray-600 mt-1">
                    Scan this code directly using your phone's camera interface
                    to verify entrance.
                  </p>

                  <div className="text-xs font-mono bg-gray-100 text-gray-600 px-4 py-2 rounded-lg border border-gray-300 max-w-sm break-all shadow-inner select-all">
                    <strong>Active Payload String:</strong>{" "}
                    {currentDailyHash.trim()}
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 italic font-serif max-w-xs">
                  No active gatepass code generated for today yet. Tap the
                  button above to create one.
                </div>
              )}
            </div>
          )}

          {!isLoadingData &&
            !isLoadingFeedback &&
            activeTab !== "gatepass" &&
            totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 flex-shrink-0">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-[#381111] text-[#E0CCB6] disabled:opacity-50 hover:brightness-110 shadow-sm transition-all"
                >
                  Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 rounded flex items-center justify-center font-bold shadow-sm transition-all ${currentPage === i + 1 ? "bg-[#E19B2D] text-white" : "bg-white text-[#381111] hover:bg-[#E0CCB6]"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-[#381111] text-[#E0CCB6] disabled:opacity-50 hover:brightness-110 shadow-sm transition-all"
                >
                  Next
                </button>
              </div>
            )}
        </div>
      </div>

      {isModalOpen && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F5EAD4] rounded-2xl w-full max-w-4xl max-h-[90dvh] flex flex-col shadow-2xl border-4 border-[#381111] overflow-hidden">
            <div className="bg-[#381111] px-6 py-4 flex justify-between items-center text-[#E0CCB6] flex-shrink-0">
              <h2 className="text-2xl font-serif font-bold">
                {modalMode === "content" &&
                  (isNewItem ? "Add New Painting" : "Edit Painting Content")}
                {modalMode === "translations" && "Edit Translations"}
                {modalMode === "quizzes" && "Edit Quizzes"}
                <span className="ml-2 opacity-70 text-lg">
                  (
                  {isNewItem
                    ? "Draft"
                    : editItem.title?.eng || `ID: ${editItem.id}`}
                  )
                </span>
              </h2>
              <button
                onClick={closeModal}
                className="text-[#E0CCB6] hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-[#4A260F]">
              {modalMode === "content" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">English Title</label>
                    <input
                      type="text"
                      value={editItem.title?.eng || ""}
                      onChange={(e) =>
                        handleJsonChange("title", "eng", e.target.value)
                      }
                      className={inputStyles}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">English Artist</label>
                    <input
                      type="text"
                      value={editItem.artist?.eng || ""}
                      onChange={(e) =>
                        handleJsonChange("artist", "eng", e.target.value)
                      }
                      className={inputStyles}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">Artist Year</label>
                    <input
                      type="text"
                      value={editItem.artist_year || ""}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          artist_year: e.target.value,
                        })
                      }
                      className={inputStyles}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      Map Zone (1, 2, 3, or 4)
                    </label>
                    <input
                      type="number"
                      value={editItem.zone || ""}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          zone: parseInt(e.target.value),
                        })
                      }
                      className={inputStyles}
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-bold text-sm">
                      English Clues (For Map)
                    </label>
                    <textarea
                      value={editItem.clues?.eng || ""}
                      onChange={(e) =>
                        handleJsonChange("clues", "eng", e.target.value)
                      }
                      rows="3"
                      className={inputStyles}
                    ></textarea>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2 bg-white p-4 rounded-xl border border-[#381111]/20 shadow-sm">
                    <label className="font-bold text-sm">
                      Artwork Image (For App Display & AR Scanner)
                    </label>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      {editItem.thumbnail_url ? (
                        <div className="relative group">
                          <img
                            src={editItem.thumbnail_url}
                            alt="Artwork Preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-[#381111]/10 shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold uppercase tracking-wide">
                              Cloud Hosted
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                          No Image
                          <br />
                          Selected
                        </div>
                      )}

                      <div className="flex flex-col gap-2 w-full">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                          className="text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#E19B2D] file:text-white hover:file:brightness-110 hover:file:shadow-md transition-all file:cursor-pointer disabled:opacity-50 text-gray-500 w-full"
                        />
                        {isUploadingImage ? (
                          <div className="flex items-center gap-2 text-[#E19B2D] text-xs font-bold animate-pulse">
                            <div className="w-3 h-3 border-2 border-[#E19B2D] border-t-transparent rounded-full animate-spin"></div>
                            Uploading image to Supabase cloud...
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 font-medium">
                            JPEG or PNG. Max file size: 5MB.
                            <br />
                            Recommended resolution: ~1000px wide.
                          </p>
                        )}

                        <input
                          type="hidden"
                          value={editItem.thumbnail_url || ""}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalMode === "translations" && (
                <div className="flex flex-col gap-6">
                  <div className="flex gap-2 border-b border-[#381111]/20 pb-2">
                    {["eng", "tag", "chi", "jap", "kor"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setTranslateLang(lang)}
                        className={`px-4 py-2 rounded-t-lg font-bold uppercase ${translateLang === lang ? "bg-[#381111] text-[#E0CCB6]" : "bg-[#E0CCB6] text-[#381111]"}`}
                      >
                        {lang === "eng"
                          ? "English"
                          : lang === "tag"
                            ? "Tagalog"
                            : lang === "chi"
                              ? "Chinese"
                              : lang === "jap"
                                ? "Japanese"
                                : "Korean"}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-[#381111]/10">
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm flex justify-between">
                        Title{" "}
                        <span className="opacity-60">
                          (EN: {editItem.title?.eng})
                        </span>
                      </label>
                      <input
                        type="text"
                        value={editItem.title?.[translateLang] || ""}
                        onChange={(e) =>
                          handleJsonChange(
                            "title",
                            translateLang,
                            e.target.value,
                          )
                        }
                        className={inputStyles}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm flex justify-between">
                        Artist{" "}
                        <span className="opacity-60">
                          (EN: {editItem.artist?.eng})
                        </span>
                      </label>
                      <input
                        type="text"
                        value={editItem.artist?.[translateLang] || ""}
                        onChange={(e) =>
                          handleJsonChange(
                            "artist",
                            translateLang,
                            e.target.value,
                          )
                        }
                        className={inputStyles}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-bold text-sm flex justify-between">
                        Clues{" "}
                        <span className="opacity-60">
                          (EN: {editItem.clues?.eng})
                        </span>
                      </label>
                      <textarea
                        value={editItem.clues?.[translateLang] || ""}
                        onChange={(e) =>
                          handleJsonChange(
                            "clues",
                            translateLang,
                            e.target.value,
                          )
                        }
                        rows="2"
                        className={inputStyles}
                      ></textarea>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-bold text-sm">
                        Artist Description
                      </label>
                      <textarea
                        value={
                          editItem.artist_description?.[translateLang] || ""
                        }
                        onChange={(e) =>
                          handleJsonChange(
                            "artist_description",
                            translateLang,
                            e.target.value,
                          )
                        }
                        rows="3"
                        className={inputStyles}
                      ></textarea>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-bold text-sm">Art Elements</label>
                      <textarea
                        value={editItem.art_element?.[translateLang] || ""}
                        onChange={(e) =>
                          handleJsonChange(
                            "art_element",
                            translateLang,
                            e.target.value,
                          )
                        }
                        rows="3"
                        className={inputStyles}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {modalMode === "quizzes" && (
                <div className="flex flex-col gap-8">
                  {["q1", "q2", "q3", "q4", "q5"].map((qNum, index) => {
                    const qData = editItem[qNum]?.eng || {
                      question: "",
                      choices: ["", "", "", ""],
                      correct_index: 0,
                    };
                    return (
                      <div
                        key={qNum}
                        className="bg-white p-4 rounded-xl border border-[#381111]/20"
                      >
                        <h4 className="font-bold text-lg mb-4 text-[#381111] border-b pb-2">
                          Question {index + 1} (English)
                        </h4>

                        <div className="flex flex-col gap-2 mb-4">
                          <label className="font-bold text-sm">
                            Question Prompt
                          </label>
                          <input
                            type="text"
                            value={qData.question || ""}
                            onChange={(e) =>
                              handleQuizChange(
                                qNum,
                                "eng",
                                "question",
                                e.target.value,
                              )
                            }
                            placeholder="Enter question..."
                            className={`${inputStyles} font-bold`}
                          />
                        </div>

                        <div className="bg-[#E0CCB6]/30 p-3 rounded-lg mb-4 text-sm border border-[#381111]/10 flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-[#381111] uppercase tracking-wider">
                              Correct Answer:
                            </span>
                            <div className="text-[#4A260F] font-bold">
                              {qData.choices[qData.correct_index] ? (
                                `"${qData.choices[qData.correct_index]}"`
                              ) : (
                                <span className="italic opacity-50 text-xs">
                                  Please Select A Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs bg-[#4A260F] text-[#E0CCB6] px-2 py-1 rounded">
                            Index: {qData.correct_index}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {[0, 1, 2, 3].map((choiceIdx) => (
                            <div
                              key={choiceIdx}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="radio"
                                name={`correct_${qNum}`}
                                checked={qData.correct_index === choiceIdx}
                                onChange={() =>
                                  handleQuizChange(
                                    qNum,
                                    "eng",
                                    "correct_index",
                                    choiceIdx,
                                  )
                                }
                                className="w-5 h-5 accent-[#E19B2D]"
                              />
                              <input
                                type="text"
                                value={qData.choices?.[choiceIdx] || ""}
                                onChange={(e) =>
                                  handleQuizChange(
                                    qNum,
                                    "eng",
                                    "choices",
                                    e.target.value,
                                    choiceIdx,
                                  )
                                }
                                placeholder={`Choice ${choiceIdx + 1}`}
                                className={`p-2 rounded border w-full bg-white text-[#381111] focus:outline-none focus:ring-2 focus:ring-[#E19B2D] ${qData.correct_index === choiceIdx ? "border-[#E19B2D] bg-[#E19B2D]/10" : "border-[#381111]/30"}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-[#E0CCB6] px-6 py-4 border-t border-[#381111]/20 flex justify-end gap-4 flex-shrink-0">
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-lg font-bold text-[#381111] hover:bg-[#381111]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                disabled={isSaving || isUploadingImage}
                className="px-6 py-2 rounded-lg font-bold bg-[#381111] text-[#E0CCB6] hover:brightness-110 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSaving ? "Saving Database..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
