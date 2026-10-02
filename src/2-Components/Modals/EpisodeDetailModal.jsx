import { Stack, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Buttons/Button";
import CustomStack from "../Stacks/CustomStack";
import TextClamped from "../Stacks/TextClamped";
import Logo from "../../1-Assets/logos/Logo.svg";
import { watchSeriesPath } from "../../lib/contentLinks";

/**
 * Episode details, shown over the season page.
 *
 * An episode has no page of its own any more, it is addressed as
 * /segments/:seasonSlug?ep=:episodeSlug, and this opens from that param. The
 * access decision is the season's, because pricing and purchases live on the
 * season: an episode carries no price list, so buying "an episode" is really
 * buying the season.
 *
 * @param {object} props
 * @param {object} props.episode the episode being shown
 * @param {object} props.season its parent season
 * @param {boolean} props.isPurchased whether the viewer already owns the season
 * @param {Function} props.handlePaymentModel opens the season payment modal
 * @param {Function} props.onClose
 */
const EpisodeDetailModal = ({
  episode,
  season,
  isPurchased = false,
  handlePaymentModel,
  onClose,
}) => {
  const navigate = useNavigate();

  // the season owns the price, so the season's access decides what is offered
  const seasonIsFree = season?.access?.toLowerCase()?.includes("free");
  const canWatch = seasonIsFree || isPurchased;

  const poster =
    episode?.posters?.find((p) => p.isBackdrop)?.url ||
    episode?.posters?.find((p) => p.isCover)?.url ||
    episode?.posters?.[0]?.url;

  /** paid seasons hand off to the season payment modal rather than nesting two */
  const handlePrimaryAction = () => {
    if (canWatch) {
      const path = watchSeriesPath(season, episode);
      if (path) navigate(path);
      return;
    }

    onClose?.();
    handlePaymentModel?.();
  };

  // escape closes, and scrolling the page behind must not happen
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!episode) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-secondary-900 bg-opacity-80 overflow-hidden"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex items-center justify-center h-screen w-full px-5 py-10 overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-secondary-900 px-5 md:px-10 py-7 w-full max-w-[900px] rounded-lg flex flex-col gap-6 relative">
          {/** close */}
          <CustomStack className="z-50 w-full justify-between items-center sticky top-0 bg-secondary-900">
            <div className="mx-0 mt-0 select-none cursor-pointer w-10 h-10">
              <img src={Logo} alt="" className="w-full h-full" />
            </div>

            <Button
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full border-2 border-[#706e72] bg-transparent p-0 flex items-center justify-center"
            >
              <span className="icon-[solar--close-square-broken] h-6 w-6 text-whites-40" />
            </Button>
          </CustomStack>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
            <div className="flex justify-start items-start w-full md:w-[380px] shrink-0">
              <img
                src={poster ?? ""}
                alt=""
                className="w-full h-[220px] md:h-[300px] object-cover rounded-lg"
              />
            </div>

            <Stack
              spacing={"16px"}
              className="flex flex-col text-whites-40 w-full md:w-auto md:flex-1"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Typography className="font-[Inter-SemiBold] text-xl md:text-2xl text-whites-40">
                  {`E${episode?.episode}`} - {episode?.title}
                </Typography>

                <span className="text-xs px-3 py-1 rounded-full border border-primary-500 text-primary-100">
                  {canWatch ? "Included" : "Rent"}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-whites-40 text-opacity-70 font-[Inter-Regular]">
                {episode?.released && <span>{episode.released}</span>}
                {episode?.runtime && <span>{episode.runtime}</span>}
                {episode?.yearOfProduction && <span>{episode.yearOfProduction}</span>}
              </div>

              {episode?.plotSummary && (
                <Typography className="font-[Inter-Regular] text-sm md:text-base text-[#FFFAF6] text-opacity-70 text-justify">
                  <TextClamped text={episode.plotSummary} lines={6} />
                </Typography>
              )}

              {episode?.overview && episode.overview !== episode.plotSummary && (
                <Typography className="font-[Inter-Regular] text-sm md:text-base text-[#FFFAF6] text-opacity-70 text-justify">
                  <TextClamped text={episode.overview} lines={6} />
                </Typography>
              )}

              {episode?.cast?.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Typography className="font-[Inter-SemiBold] text-sm text-whites-40">
                    Cast
                  </Typography>
                  <Typography className="font-[Inter-Regular] text-sm text-[#FFFAF6] text-opacity-70">
                    {episode.cast.slice(0, 6).join(", ")}
                  </Typography>
                </div>
              )}
            </Stack>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-end w-full">
            <Button
              onClick={onClose}
              className="w-full sm:w-auto min-w-[140px] rounded-full border-2 border-[#706e72] bg-transparent text-whites-40 font-[Roboto-Regular] text-sm sm:text-base"
            >
              Close
            </Button>

            <Button
              onClick={handlePrimaryAction}
              disabled={!canWatch && !handlePaymentModel}
              className="w-full sm:w-auto min-w-[160px] rounded-full border-2 border-primary-500 bg-transparent text-whites-40 font-[Roboto-Regular] text-sm sm:text-base"
            >
              {canWatch ? "Watch" : "Pay to watch"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeDetailModal;