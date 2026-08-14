// features/reels/ReelMenu.jsx
//
// REPLACES the previous Edit/Delete-or-Report-only menu with the
// grouped, contextual VibeHub menu (§7). Kept the working accessibility
// primitives from the old version unchanged (aria-haspopup, aria-expanded,
// role=menu/menuitem, click-outside, Escape) and extended them: `open`/
// `onOpenChange` are now controllable from outside (ReelViewer needs to
// close this on Escape itself, per its own keyboard handler), but the
// component still manages its own state by default so ReelCard's usage
// (uncontrolled) doesn't need to change.
//
// Items with no real backend yet render disabled rather than being
// hidden or faked — see individual comments below for which ones those
// are and what they need before they can go live.

import { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical, Expand, Maximize, MessageSquareText, Info, Flame, ThumbsDown, HelpCircle, SlidersHorizontal, VolumeX, Bookmark, FolderPlus, Share2, Link as LinkIcon, Flag, EyeOff, Pencil, BarChart3, Trash2, Users } from "lucide-react";
import { ContentApi } from "../../api/contentApi";

export default function ReelMenu({
  isOwner = false,
  reel,
  open: controlledOpen,
  onOpenChange,
  onDeleted,
  onEnterImmersive,   // NEW — navigates to /reel/:id
  hideImmersiveEntry = false, // NEW — true when rendered inside ReelViewer itself
  onEnterFullscreen,
  onOpenComments,
  onOpenFeedback,
  onShare,
  onEdit,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen((v) => (typeof v === "boolean" ? !v : true)), [setOpen]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close();
    };
    const handleEscape = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  const handleDelete = useCallback(async () => {
    if (!reel?.id || deleting) return;
    setDeleting(true);
    try {
      await ContentApi.deleteReel(reel.id);
      onDeleted?.(reel.id);
    } catch (err) {
      console.error("Delete reel failed:", err);
    } finally {
      setDeleting(false);
      close();
    }
  }, [reel?.id, deleting, onDeleted, close]);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/reel/${reel.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error("Copy link failed:", err);
    }
    close();
  }, [reel?.id, close]);

  const act = (fn) => () => { fn?.(); close(); };

  const viewerSections = [
    {
      title: "VIEWING",
      items: [
        { key: "enter_immersive", label: "Enter immersive mode", icon: Expand, onClick: onEnterImmersive ? act(onEnterImmersive) : null },
        { key: "fullscreen", label: "Fullscreen", icon: Maximize, onClick: onEnterFullscreen ? act(onEnterFullscreen) : null },
        { key: "captions", label: "Captions", icon: MessageSquareText, onClick: null },
        { key: "description", label: "Show description", icon: Info, onClick: null },
      ].filter((item) => !(item.key === "enter_immersive" && hideImmersiveEntry)),
    },
    {
      title: "DISCOVER",
      items: [
        { key: "more_like_this", label: "More like this", icon: Flame, onClick: null },
        { key: "not_interested", label: "Not interested", icon: ThumbsDown, onClick: onOpenFeedback ? act(onOpenFeedback) : null },
        { key: "why_seeing_this", label: "Why am I seeing this?", icon: HelpCircle, onClick: onOpenFeedback ? act(onOpenFeedback) : null },
        { key: "tune_feed", label: "Tune my feed", icon: SlidersHorizontal, onClick: onOpenFeedback ? act(onOpenFeedback) : null },
        { key: "mute_creator", label: "Mute creator", icon: VolumeX, onClick: null },
      ],
    },
    {
      title: "SAVE",
      items: [
        { key: "save", label: "Save", icon: Bookmark, onClick: null },
        { key: "add_collection", label: "Add to collection", icon: FolderPlus, onClick: null },
      ],
    },
    {
      title: "SHARE",
      items: [
        { key: "share", label: "Share reel", icon: Share2, onClick: onShare ? act(onShare) : null },
        { key: "copy_link", label: "Copy link", icon: LinkIcon, onClick: act(handleCopyLink) },
      ],
    },
    {
      title: "SAFETY",
      items: [
        { key: "report", label: "Report", icon: Flag, danger: true, onClick: null },
        { key: "hide_reel", label: "Hide reel", icon: EyeOff, onClick: null },
      ],
    },
  ];

  const ownerSections = [
    {
      title: null,
      items: [
        { key: "edit", label: "Edit", icon: Pencil, onClick: onEdit ? act(onEdit) : null },
        { key: "manage_comments", label: "Manage comments", icon: Users, onClick: onOpenComments ? act(onOpenComments) : null },
        { key: "analytics", label: "View analytics", icon: BarChart3, onClick: null },
        { key: "copy_link", label: "Copy link", icon: LinkIcon, onClick: act(handleCopyLink) },
        { key: "delete", label: deleting ? "Deleting…" : "Delete", icon: Trash2, danger: true, onClick: handleDelete, disabled: deleting },
      ],
    },
  ];

  const sections = isOwner ? ownerSections : viewerSections;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
      >
        <MoreVertical size={20} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-64 max-h-[70vh] overflow-y-auto bg-neutral-900/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl py-1 z-50"
        >
          {sections.map((section, si) => (
            <div key={si} className={si > 0 ? "border-t border-white/10 mt-1 pt-1" : ""}>
              {section.title && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-white/40">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const disabled = item.disabled ?? !item.onClick;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    role="menuitem"
                    disabled={disabled}
                    onClick={item.onClick ?? undefined}
                    title={disabled ? "Coming soon" : undefined}
                    className={`w-full flex items-center gap-3 text-left px-3 py-2 text-sm transition ${
                      disabled
                        ? "text-white/30 cursor-not-allowed"
                        : item.danger
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}