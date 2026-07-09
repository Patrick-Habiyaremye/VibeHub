import useReelsFeed from "./useReelsFeed";
import useReelsRealtime from "./useReelsRealtime";
import useReactionsRealtime from "./useReactionsRealtime";
import { useAuth } from "../context/AuthContext";

export default function useReels() {
  const { user } = useAuth();

  const feed = useReelsFeed(user?.id);
  //const feed = useReelsFeed();

  useReelsRealtime(feed.setReels, user);
  useReactionsRealtime(feed.setReels, user);

  return feed;
}