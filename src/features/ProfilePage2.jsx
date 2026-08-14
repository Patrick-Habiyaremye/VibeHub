// import {
//   Lock,
//   MapPin,
//   Calendar,
//   Globe,
//   Edit,
//   ShieldCheck,
//   Camera,
//   Trash2,
//   X,
//   Loader2,
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import Cropper from "react-easy-crop";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { useAuth } from "../context/AuthContext";
// import ProfileController from "../controllers/profileController";
// import { ContentApi } from "../api/contentApi"; // <-- MUST expose getPosts & getReels

// const FALLBACK_COVER = "https://picsum.photos/1200/400";
// const FALLBACK_AVATAR = "https://i.pravatar.cc/300";

// const MAX_FILE_SIZE_MB = 10;
// const OUTPUT_QUALITY = 0.82; // jpeg quality — good balance of size vs fidelity
// const AVATAR_MAX_DIMENSION = 512; // avatar output capped at 512x512
// const COVER_MAX_WIDTH = 1200; // cover output capped at 1200px wide (3:1 aspect)

// export default function ProfilePage2() {
//   const { user } = useAuth();

//   /* ---------- profile data ---------- */
//   const [data, setData] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [reels, setReels] = useState([]);
//   const [activeTab, setActiveTab] = useState("Posts");
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const [loadError, setLoadError] = useState(null);

//   /* ---------- shared action error banner ---------- */
//   const [actionError, setActionError] = useState(null);

//   /* ---------- avatar state ---------- */
//   const [avatarPreview, setAvatarPreview] = useState(null);
//   const [uploadingAvatar, setUploadingAvatar] = useState(false);
//   const [avatarProgress, setAvatarProgress] = useState(0);
//   const [deletingAvatar, setDeletingAvatar] = useState(false);
//   const [avatarFailed, setAvatarFailed] = useState(false);

//   /* ---------- cover state ---------- */
//   const [coverPreview, setCoverPreview] = useState(null);
//   const [uploadingCover, setUploadingCover] = useState(false);
//   const [coverProgress, setCoverProgress] = useState(0);
//   const [deletingCover, setDeletingCover] = useState(false);
//   const [coverFailed, setCoverFailed] = useState(false);

//   /* ---------- shared crop modal (avatar or cover) ---------- */
//   const [cropMode, setCropMode] = useState(false);
//   const [cropTarget, setCropTarget] = useState(null); // "avatar" | "cover"
//   const [imageSrc, setImageSrc] = useState(null);
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//   const [processing, setProcessing] = useState(false);

//   /* ---------- shared delete confirmation ---------- */
//   const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null); // "avatar" | "cover"

//   const avatarInputRef = useRef(null);
//   const coverInputRef = useRef(null);
//   const objectUrlsRef = useRef(new Set());

//   /* ----------------------------------------
//      LOAD PROFILE
//   ---------------------------------------- */

//   useEffect(() => {
//     if (!user) return;
//     loadAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   useEffect(() => {
//     return () => {
//       objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
//       objectUrlsRef.current.clear();
//     };
//   }, []);

//   const trackObjectUrl = (url) => {
//     objectUrlsRef.current.add(url);
//     return url;
//   };

//   const releaseObjectUrl = (url) => {
//     if (!url) return;
//     URL.revokeObjectURL(url);
//     objectUrlsRef.current.delete(url);
//   };

//   async function loadAll() {
//     setLoadingProfile(true);
//     setLoadError(null);

//     try {
//       const [profileData, p, r] = await Promise.all([
//         ProfileController.getFullProfile(user.id),
//         ContentApi.getPosts({ userId: user.id }),
//         ContentApi.getReels({ userId: user.id }),
//       ]);

//       setData(profileData);
//       setPosts(Array.isArray(p) ? p : []);
//       setReels(Array.isArray(r) ? r : []);
//     } catch (err) {
//       console.error("Profile load error:", err);
//       setLoadError("We couldn't load this profile. Please try again.");
//     } finally {
//       setLoadingProfile(false);
//     }
//   }

//   /* ----------------------------------------
//      VALIDATION
//   ---------------------------------------- */

//   const validateFile = (file) => {
//     if (!file.type.startsWith("image/")) {
//       setActionError("Please choose an image file.");
//       return false;
//     }
//     if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
//       setActionError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
//       return false;
//     }
//     return true;
//   };

//   /* ----------------------------------------
//      FILE SELECT -> OPEN CROP MODAL
//   ---------------------------------------- */

//   const handleAvatarClick = useCallback(() => {
//     if (uploadingAvatar || deletingAvatar) return;
//     avatarInputRef.current?.click();
//   }, [uploadingAvatar, deletingAvatar]);

//   const handleCoverClick = useCallback(() => {
//     if (uploadingCover || deletingCover) return;
//     coverInputRef.current?.click();
//   }, [uploadingCover, deletingCover]);

//   const openCropModal = (file, target) => {
//     setActionError(null);
//     const url = trackObjectUrl(URL.createObjectURL(file));
//     setImageSrc(url);
//     setCropTarget(target);
//     setCrop({ x: 0, y: 0 });
//     setZoom(1);
//     setCroppedAreaPixels(null);
//     setCropMode(true);
//   };

//   const handleAvatarChange = (e) => {
//     const file = e.target.files?.[0];
//     if (avatarInputRef.current) avatarInputRef.current.value = "";
//     if (!file || !validateFile(file)) return;
//     openCropModal(file, "avatar");
//   };

//   const handleCoverChange = (e) => {
//     const file = e.target.files?.[0];
//     if (coverInputRef.current) coverInputRef.current.value = "";
//     if (!file || !validateFile(file)) return;
//     openCropModal(file, "cover");
//   };

//   /* ----------------------------------------
//      CROPPING
//   ---------------------------------------- */

//   const onCropComplete = useCallback((_, pixels) => {
//     setCroppedAreaPixels(pixels);
//   }, []);

//   const closeCropModal = () => {
//     releaseObjectUrl(imageSrc);
//     setCropMode(false);
//     setCropTarget(null);
//     setImageSrc(null);
//     setCroppedAreaPixels(null);
//   };

//   /**
//    * Crops to the selected area, then downsamples + re-encodes as JPEG
//    * so uploads stay small and fast regardless of the source image size.
//    * Output size depends on target: avatars are capped square, covers
//    * are capped by width (aspect is fixed at 3:1 by the cropper).
//    */
//   const getCroppedAndCompressedImage = async (target) => {
//     const image = new Image();
//     image.crossOrigin = "anonymous";
//     image.src = imageSrc;
//     await new Promise((resolve, reject) => {
//       image.onload = resolve;
//       image.onerror = () => reject(new Error("Failed to load image"));
//     });

//     const { width: cropWidth, height: cropHeight, x, y } = croppedAreaPixels;

//     const maxDimension =
//       target === "cover" ? COVER_MAX_WIDTH : AVATAR_MAX_DIMENSION;
//     const boundBy = target === "cover" ? cropWidth : Math.max(cropWidth, cropHeight);
//     const scale = Math.min(1, maxDimension / boundBy);

//     const outputWidth = Math.round(cropWidth * scale);
//     const outputHeight = Math.round(cropHeight * scale);

//     const canvas = document.createElement("canvas");
//     canvas.width = outputWidth;
//     canvas.height = outputHeight;

//     const ctx = canvas.getContext("2d");
//     ctx.imageSmoothingEnabled = true;
//     ctx.imageSmoothingQuality = "high";

//     ctx.drawImage(
//       image,
//       x,
//       y,
//       cropWidth,
//       cropHeight,
//       0,
//       0,
//       outputWidth,
//       outputHeight
//     );

//     return new Promise((resolve, reject) => {
//       canvas.toBlob(
//         (blob) => {
//           if (!blob) {
//             reject(new Error("Failed to process image"));
//             return;
//           }
//           resolve(blob);
//         },
//         "image/jpeg",
//         OUTPUT_QUALITY
//       );
//     });
//   };

//   /* ----------------------------------------
//      CROP MODAL CONFIRM -> UPLOAD
//   ---------------------------------------- */

//   const handleCropConfirm = async () => {
//     if (!croppedAreaPixels) return;
//     const target = cropTarget;

//     setProcessing(true);
//     let blob;
//     try {
//       blob = await getCroppedAndCompressedImage(target);
//     } catch (err) {
//       console.error("Image processing error:", err);
//       setActionError("Couldn't process that image. Please try another.");
//       setProcessing(false);
//       return;
//     }
//     setProcessing(false);
//     closeCropModal();

//     if (target === "cover") {
//       await uploadCover(blob);
//     } else {
//       await uploadAvatar(blob);
//     }
//   };

//   const uploadAvatar = async (blob) => {
//     const localUrl = trackObjectUrl(URL.createObjectURL(blob));

//     setAvatarFailed(false);
//     setAvatarPreview(localUrl);
//     setUploadingAvatar(true);
//     setAvatarProgress(0);
//     setActionError(null);

//     try {
//       const updated = await ProfileController.updateAvatar(
//         user.id,
//         blob,
//         (pct) => setAvatarProgress(pct)
//       );
//       setData((prev) =>
//         prev
//           ? {
//               ...prev,
//               profile: { ...prev.profile, avatar_url: updated.avatar_url },
//             }
//           : prev
//       );
//     } catch (err) {
//       console.error("Avatar upload error:", err);
//       setActionError(
//         err?.message ||
//           err?.error_description ||
//           "Avatar upload failed. Please try again."
//       );
//       setAvatarPreview(null);
//     } finally {
//       setUploadingAvatar(false);
//       releaseObjectUrl(localUrl);
//     }
//   };

//   const uploadCover = async (blob) => {
//     const localUrl = trackObjectUrl(URL.createObjectURL(blob));

//     setCoverFailed(false);
//     setCoverPreview(localUrl);
//     setUploadingCover(true);
//     setCoverProgress(0);
//     setActionError(null);

//     try {
//       const updated = await ProfileController.updateCover(
//         user.id,
//         blob,
//         (pct) => setCoverProgress(pct)
//       );
//       setData((prev) =>
//         prev
//           ? {
//               ...prev,
//               profile: { ...prev.profile, cover_image: updated.cover_image },
//             }
//           : prev
//       );
//     } catch (err) {
//       console.error("Cover upload error:", err);
//       setActionError(
//         err?.message ||
//           err?.error_description ||
//           "Cover upload failed. Please try again."
//       );
//       setCoverPreview(null);
//     } finally {
//       setUploadingCover(false);
//       releaseObjectUrl(localUrl);
//     }
//   };

//   /* ----------------------------------------
//      DELETE / RESET
//   ---------------------------------------- */

//   const handleConfirmDelete = async () => {
//     const target = confirmDeleteTarget;
//     setConfirmDeleteTarget(null);
//     setActionError(null);

//     if (target === "avatar") {
//       setDeletingAvatar(true);
//       try {
//         await ProfileController.deleteAvatar(user.id, data?.profile?.avatar_url);
//         setAvatarPreview(null);
//         setData((prev) =>
//           prev
//             ? { ...prev, profile: { ...prev.profile, avatar_url: null } }
//             : prev
//         );
//       } catch (err) {
//         console.error("Delete avatar error:", err);
//         setActionError(
//           err?.message ||
//             err?.error_description ||
//             "Couldn't remove your avatar. Please try again."
//         );
//       } finally {
//         setDeletingAvatar(false);
//       }
//     } else if (target === "cover") {
//       setDeletingCover(true);
//       try {
//         await ProfileController.deleteCover(user.id, data?.profile?.cover_image);
//         setCoverPreview(null);
//         setData((prev) =>
//           prev
//             ? { ...prev, profile: { ...prev.profile, cover_image: null } }
//             : prev
//         );
//       } catch (err) {
//         console.error("Delete cover error:", err);
//         setActionError(
//           err?.message ||
//             err?.error_description ||
//             "Couldn't remove your cover photo. Please try again."
//         );
//       } finally {
//         setDeletingCover(false);
//       }
//     }
//   };

//   /* ----------------------------------------
//      STATES
//   ---------------------------------------- */

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
//         <div className="bg-white p-8 rounded-2xl text-center max-w-sm w-full">
//           <Lock size={45} className="mx-auto mb-4" />
//           <h2 className="text-xl font-bold">Login Required</h2>
//           <p className="text-gray-500 mt-2">
//             Please sign in to view this profile.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (loadingProfile) {
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-gray-50">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="animate-spin text-purple-600" size={36} />
//           <p className="text-gray-500 font-medium">Loading profile…</p>
//         </div>
//       </div>
//     );
//   }

//   if (loadError || !data) {
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
//         <div className="text-center max-w-sm">
//           <p className="text-gray-700 font-semibold mb-4">
//             {loadError || "This profile is unavailable."}
//           </p>
//           <button
//             onClick={loadAll}
//             className="bg-purple-600 text-white px-5 py-2 rounded-xl"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   /* ----------------------------------------
//      DERIVED DATA
//   ---------------------------------------- */

//   const { profile, reputation = {}, achievements = { unlocked: [] } } = data;
//   const isOwnProfile = user.id === profile.id || user.id === profile.user_id;

//   const postsCount = posts.length;
//   const supporters = profile.supporters_count ?? 0;
//   const supporting = profile.supporting_count ?? 0;
//   const streak = profile.streak_count ?? 0;

//   const currentCoverUrl = profile.cover_image || null;
//   const currentAvatarUrl = profile.avatar_url || null;

//   const coverImage =
//     coverPreview || (!coverFailed && currentCoverUrl) || FALLBACK_COVER;
//   const avatarImage =
//     avatarPreview || (!avatarFailed && currentAvatarUrl) || FALLBACK_AVATAR;

//   const hasCustomCover = Boolean(coverPreview || currentCoverUrl);
//   const hasCustomAvatar = Boolean(avatarPreview || currentAvatarUrl);

//   const coverBusy = uploadingCover || deletingCover;
//   const avatarBusy = uploadingAvatar || deletingAvatar;

//   /* ----------------------------------------
//      UI
//   ---------------------------------------- */

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       {actionError && (
//         <div className="sticky top-0 z-40 flex items-center justify-center gap-3 bg-red-50 text-red-700 text-sm py-2 px-4">
//           <span>{actionError}</span>
//           <button
//             onClick={() => setActionError(null)}
//             aria-label="Dismiss error"
//           >
//             <X size={14} />
//           </button>
//         </div>
//       )}

//       {/* COVER */}
//       <div className="relative h-72 bg-gray-200 overflow-hidden">
//         <img
//           src={coverImage}
//           alt={`${profile.full_name || profile.username}'s cover`}
//           className="w-full h-full object-cover"
//           onError={() => setCoverFailed(true)}
//         />

//         <div className="absolute inset-0 bg-black/20" />

//         {uploadingCover && (
//           <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-2">
//             <Loader2 className="animate-spin" size={24} />
//             <div className="flex items-center gap-2 text-sm font-medium">
//               <span>{coverProgress}%</span>
//             </div>
//             <div className="w-40 h-1.5 bg-white/30 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-white transition-all duration-150"
//                 style={{ width: `${coverProgress}%` }}
//               />
//             </div>
//           </div>
//         )}

//         {deletingCover && !uploadingCover && (
//           <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
//             <Loader2 className="animate-spin" size={24} />
//           </div>
//         )}

//         {isOwnProfile && !coverBusy && (
//           <>
//             <input
//               ref={coverInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={handleCoverChange}
//             />
//             <div className="absolute bottom-4 right-4 flex gap-2">
//               {hasCustomCover && (
//                 <button
//                   onClick={() => setConfirmDeleteTarget("cover")}
//                   className="flex items-center gap-2 bg-white/90 hover:bg-white text-red-600 px-3 py-2 rounded-xl shadow font-medium text-sm"
//                   aria-label="Remove cover photo"
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               )}
//               <button
//                 onClick={handleCoverClick}
//                 className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl shadow font-medium text-sm"
//               >
//                 <Camera size={16} />
//                 Change cover
//               </button>
//             </div>
//           </>
//         )}

//         {/* AVATAR — overlaps the bottom-left of the cover */}
//         <div className="absolute bottom-0 left-6 translate-y-16 group">
//           <img
//             src={avatarImage}
//             alt={`${profile.full_name || profile.username}'s avatar`}
//             className="w-40 h-40 rounded-full border-4 border-white object-cover mb-16 bg-gray-100"
//             onError={() => setAvatarFailed(true)}
//           />

//           {!avatarBusy && isOwnProfile && (
//             <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
//               <button
//                 onClick={handleAvatarClick}
//                 className="flex flex-col items-center gap-0.5"
//                 aria-label="Change avatar"
//               >
//                 <Camera size={20} />
//                 <span className="text-xs">Change</span>
//               </button>
//               {hasCustomAvatar && (
//                 <button
//                   onClick={() => setConfirmDeleteTarget("avatar")}
//                   className="mt-1 flex items-center gap-1 text-xs text-red-200 hover:text-red-100"
//                   aria-label="Remove avatar"
//                 >
//                   <Trash2 size={12} />
//                   Remove
//                 </button>
//               )}
//             </div>
//           )}

//           {uploadingAvatar && (
//             <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white">
//               <span className="text-sm font-medium">{avatarProgress}%</span>
//               <div className="w-16 h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
//                 <div
//                   className="h-full bg-white transition-all duration-150"
//                   style={{ width: `${avatarProgress}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           {deletingAvatar && !uploadingAvatar && (
//             <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white">
//               <Loader2 className="animate-spin" size={22} />
//             </div>
//           )}

//           {isOwnProfile && (
//             <input
//               ref={avatarInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={handleAvatarChange}
//             />
//           )}
//         </div>
//       </div>

//       {/* HEADER */}
//       <div className="max-w-6xl mx-auto px-6 mt-20">
//         <div className="flex justify-between items-start gap-4">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2">
//               <h1 className="text-3xl font-bold">
//                 {profile.full_name || profile.username}
//               </h1>
//               {profile.is_verified && <ShieldCheck className="text-blue-500" />}
//             </div>

//             <p className="text-gray-500">@{profile.username}</p>

//             {/* REPUTATION */}
//             <div className="mt-2 flex items-center gap-3 flex-wrap">
//               <span className="font-semibold text-purple-600">
//                 Level {reputation.level || 1}
//               </span>
//               <span className="text-gray-500">{reputation.title || "Newbie"}</span>
//             </div>

//             <div
//               className="mt-2 w-48 h-2 bg-gray-200 rounded-full"
//               role="progressbar"
//               aria-valuenow={Math.round((reputation.progress || 0) * 100)}
//               aria-valuemin={0}
//               aria-valuemax={100}
//             >
//               <div
//                 className="h-full bg-purple-600 rounded-full transition-all"
//                 style={{
//                   width: `${Math.min(
//                     100,
//                     Math.max(0, (reputation.progress || 0) * 100)
//                   )}%`,
//                 }}
//               />
//             </div>

//             <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
//               {profile.location && (
//                 <span className="flex gap-1 items-center">
//                   <MapPin size={16} />
//                   {profile.location}
//                 </span>
//               )}

//               <span className="flex gap-1 items-center">
//                 <Calendar size={16} />
//                 Joined{" "}
//                 {profile.created_at
//                   ? new Date(profile.created_at).toLocaleDateString()
//                   : "recently"}
//               </span>

//               {profile.website && (
//                 <a
//                   href={profile.website}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex gap-1 items-center hover:text-purple-600"
//                 >
//                   <Globe size={16} />
//                   {profile.website}
//                 </a>
//               )}
//             </div>

//             <p className="mt-4 max-w-xl text-gray-700 break-words">
//               {profile.bio || "Spreading positivity ✨"}
//             </p>
//           </div>

//           {isOwnProfile && (
//             <Link to="/settings" className="shrink-0">
//               <button className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition-colors">
//                 <Edit size={18} />
//                 Edit Profile
//               </button>
//             </Link>
//           )}
//         </div>

//         {/* IMPACT */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
//           <ImpactCard title="Posts" value={postsCount} />
//           <ImpactCard title="Supporters" value={supporters} />
//           <ImpactCard title="Supporting" value={supporting} />
//           <ImpactCard title="Streaks" value={streak} />
//         </div>

//         {/* ACHIEVEMENTS */}
//         {achievements.unlocked.length > 0 && (
//           <div className="mt-10">
//             <h2 className="text-xl font-bold mb-4">Achievements</h2>
//             <div className="flex flex-wrap gap-3">
//               {achievements.unlocked.map((a) => (
//                 <div
//                   key={a.id}
//                   className="bg-white px-4 py-2 rounded-xl shadow text-sm"
//                 >
//                   {a.icon} {a.title}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* TABS */}
//         <div className="mt-10 bg-white rounded-xl shadow">
//           <div className="flex border-b" role="tablist">
//             {["Posts", "Reels", "Activity"].map((tab) => (
//               <button
//                 key={tab}
//                 role="tab"
//                 aria-selected={activeTab === tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`flex-1 py-4 font-semibold transition-colors ${
//                   activeTab === tab
//                     ? "text-purple-600 border-b-2 border-purple-600"
//                     : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           <div className="p-6">
//             {activeTab === "Posts" && (
//               <div className="space-y-6">
//                 {posts.length === 0 ? (
//                   <p className="text-gray-500 text-center">No posts yet.</p>
//                 ) : (
//                   posts.map((post) => (
//                     <div key={post.id} className="p-4 border rounded-lg">
//                       {post.content}
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}

//             {activeTab === "Reels" && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {reels.length === 0 ? (
//                   <p className="text-gray-500 col-span-full text-center">
//                     No reels yet.
//                   </p>
//                 ) : (
//                   reels.map((reel) => (
//                     <video
//                       key={reel.id}
//                       src={reel.video_url}
//                       className="w-full rounded-lg"
//                       controls
//                       preload="metadata"
//                     />
//                   ))
//                 )}
//               </div>
//             )}

//             {activeTab === "Activity" && (
//               <div className="text-center text-gray-500">
//                 Activity coming soon.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* CROP MODAL — shared by avatar + cover */}
//       {cropMode && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
//           <div className="bg-white p-4 rounded-xl w-full max-w-md">
//             <h3 className="font-semibold mb-3 text-gray-800">
//               {cropTarget === "cover" ? "Adjust cover photo" : "Adjust your photo"}
//             </h3>

//             <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
//               <Cropper
//                 image={imageSrc}
//                 crop={crop}
//                 zoom={zoom}
//                 aspect={cropTarget === "cover" ? 1200 / 400 : 1}
//                 cropShape={cropTarget === "avatar" ? "round" : "rect"}
//                 showGrid={cropTarget !== "avatar"}
//                 onCropChange={setCrop}
//                 onZoomChange={setZoom}
//                 onCropComplete={onCropComplete}
//               />
//             </div>

//             <input
//               type="range"
//               min={1}
//               max={3}
//               step={0.1}
//               value={zoom}
//               onChange={(e) => setZoom(Number(e.target.value))}
//               className="w-full mt-4"
//               aria-label="Zoom"
//             />

//             <div className="flex justify-between mt-4">
//               <button
//                 onClick={closeCropModal}
//                 disabled={processing}
//                 className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCropConfirm}
//                 disabled={processing || !croppedAreaPixels}
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
//               >
//                 {processing && <Loader2 className="animate-spin" size={14} />}
//                 {processing ? "Processing…" : "Upload"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* DELETE CONFIRMATION — shared by avatar + cover */}
//       {confirmDeleteTarget && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
//           <div className="bg-white p-5 rounded-xl w-full max-w-xs text-center">
//             <h3 className="font-semibold text-gray-800 mb-2">
//               Remove {confirmDeleteTarget === "cover" ? "cover photo" : "profile photo"}?
//             </h3>
//             <p className="text-sm text-gray-500 mb-4">
//               You can always upload a new one later.
//             </p>
//             <div className="flex justify-center gap-3">
//               <button
//                 onClick={() => setConfirmDeleteTarget(null)}
//                 className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmDelete}
//                 className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* COMPONENT */

// function ImpactCard({ title, value }) {
//   return (
//     <div className="bg-white rounded-xl shadow p-5 text-center">
//       <p className="text-gray-500">{title}</p>
//       <h2 className="text-2xl font-bold">{value}</h2>
//     </div>
//   );
// }