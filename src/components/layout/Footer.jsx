import { Link } from "react-router-dom";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer
      className="
        hidden
        lg:block
        mt-10
        border-t
        border-slate-800
        bg-slate-900
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-10
        "
      >
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-10
          "
        >
          {/* Brand */}

          <div>
            <Logo />
            <p className="mt-3 text-slate-400 leading-relaxed">
              A positive social platform where kindness,
              inspiration and meaningful connections help
              people spread smiles every day.
            </p>
          </div>

          {/* Quick Links */}

          <div>
            <h3 className="font-semibold text-white mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3">

              <Link
                to="/feed"
                className="text-slate-400 hover:text-yellow-400 transition"
              >
                Feed
              </Link>

              <Link
                to="/discover"
                className="text-slate-400 hover:text-yellow-400 transition"
              >
                Discover
              </Link>

              <Link
                to="/challenges"
                className="text-slate-400 hover:text-yellow-400 transition"
              >
                Challenges
              </Link>

              <Link
                to="/settings"
                className="text-slate-400 hover:text-yellow-400 transition"
              >
                Settings
              </Link>

            </div>
          </div>

          {/* Community */}

          <div>
            <h3 className="font-semibold text-white mb-4">
              Community
            </h3>

            <div className="space-y-3 text-slate-400">

              <p>💛 Spread kindness</p>

              <p>😊 Inspire others</p>

              <p>🌈 Build positive habits</p>

              <p>✨ Make someone smile today</p>

            </div>
          </div>
        </div>

        {/* Bottom */}

        <div
          className="
            mt-10
            pt-6
            border-t
            border-slate-800
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-4
          "
        >
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} VibeHub.
            All rights reserved.
          </p>

          <p className="text-sm text-slate-500">
            Spread positivity everywhere ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}