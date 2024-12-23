import ratedGImg from "../ratings/RatedG.svg";
import ratedPGImg from "../ratings/RatedPG.svg";
import rated13Img from "../ratings/Rated13.svg";
import rated17Img from "../ratings/Rated17.svg";
import ratedRImg from "../ratings/RatedR.svg";

export const ratingArray = [
  {
    ratedId: "rated_G",
    btntitle: "GENERAL AUDIENCES",
    btnText: "Nothing that would offend parents for viewing by children.",
    btnImg: ratedGImg,
  },
  {
    ratedId: "rated_PG",
    btntitle: "PARENTAL GUIDANCE SUGGESTED",
    btnText: `Parents urged to give “parental guidance.” May contain some material parents might not like for their young children`,
    btnImg: ratedPGImg,
  },
  {
    ratedId: "rated_13",
    btntitle: "PARENTS STRONGLY CAUTIONED",
    btnText: `Parents are urged to be cautious. Some material may be inappropriate for pre-teenagers.`,
    btnImg: rated13Img,
  },
  {
    ratedId: "rated_R",
    btntitle: "RESTRICTED",
    btnText: `Contains some adult material. Parents are urged to learn more about the film before taking their young children with them.`,
    btnImg: ratedRImg,
  },
  {
    ratedId: "rated_18",
    btntitle: "NO ONE 17 AND UNDER ADMITTED",
    btnText: `Contains some adult material. Parents are urged to learn more about the film before taking their young children with them.`,
    btnImg: rated17Img,
  },
];
