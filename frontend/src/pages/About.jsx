import { useTranslation } from "react-i18next";
import { Database, Mail, Globe } from "lucide-react";
import headshotImg from "../assets/headshot.jpg";
import githubLogo from "../assets/GitHub_Invertocat_Black.svg";
import BuyMeACoffee from "../assets/blue-button.png";

function About() {
  const { t } = useTranslation();

  return (
    <div className="center h-screen">
      <div className="flex flex-col overflow-hidden w-3/10 h-8/10 bg-white rounded-4xl shadow-2xl border-5 border-white">
        <div className="flex-1 bg-darker-primary">
          <div className="center flex-col gap-2 h-full px-8">
            <div className="w-1/2 aspect-square overflow-hidden mb-3 mx-auto rounded-xl">
              <img
                src={headshotImg}
                alt=""
                className="w-full h-full object-center object-cover"
              />
            </div>
            <h2
              className="text-4xl font-bold text-darker-accent"
              style={{
                textShadow:
                  "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
              }}
            >
              {t("about.authorName")}
            </h2>
            <h3 className="mb-8 text-white/70 font-semibold">
              {t("about.authorDescription")}
            </h3>

            <div className="flex gap-3 mb-6">
              <a
                href="https://github.com/MiipisSus"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 hover:scale-125 transition-transform duration-200 cursor-pointer"
                aria-label="GitHub"
              >
                <img src={githubLogo} alt="GitHub" className="w-full h-full" />
              </a>
              <a
                href="mailto:kokurui0113@gmail.com"
                className="center size-8 bg-red-600 rounded-full hover:scale-125 transition-transform duration-200 cursor-pointer"
                aria-label="Email"
              >
                <Mail className="p-0.5 text-white" />
              </a>
              <a
                href="https://miipissus.github.io/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="center size-8 bg-darker-accent rounded-full hover:scale-125 transition-transform duration-200 cursor-pointer"
                aria-label="Website"
              >
                <Globe className="p-0.5 text-white" />
              </a>
            </div>
            <div className="w-50">
              <img
                src={BuyMeACoffee}
                alt="Buy me a coffee"
                className="cursor-pointer"
                onClick={() =>
                  window.open(
                    "https://www.buymeacoffee.com/miipissus",
                    "_blank",
                  )
                }
              />
            </div>
          </div>
        </div>
        <small className="center h-3/20 bg-white text-gray-500">
          <Database className="size-4 mr-1" />
          Data Powered By&nbsp;
          <a
            href="https://github.com/ElliottLandsborough/dog-ceo-api"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Dog CEO API
          </a>
        </small>
      </div>
    </div>
  );
}

export default About;
