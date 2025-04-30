import { useQuery } from "@tanstack/react-query";
import {  getAllCategories, getAllFilms,  getAllSeasons,  getFilmContent, getSeasonContent,getSeasonContentMobile, getSimilarFilms, getUserPurchaseList, getUserWatchList, getVideoSourceFilm, getFilmContentMobile } from "./api";


export function useGetAllCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getAllCategories,
       
    });
}

export function useGetAllSeasons() {
    return useQuery({
        queryKey: ["seasons"],
        queryFn: getAllSeasons,
       
    });
}

export function useGetSeason(id: String) {
    return useQuery({
        queryKey: ["season", id],
        queryFn: () => getSeasonContent(id),
       
    });
}

export function useGetSeasonMobile(id: String) {
    return useQuery({
        queryKey: ["season", id],
        queryFn: () => getSeasonContentMobile(id),
       
    });
}


export function useGetAllFilms() {
    return useQuery({
        queryKey: ["films"],
        queryFn: getAllFilms,
       
    });
}

export function useGetFilm(id: String) {
    return useQuery({
        queryKey: ["film", id],
        queryFn: () => getFilmContent(id),
       
    });
}

export function useGetFilmMobile(id: String) {
    return useQuery({
        queryKey: ["film", id],
        queryFn: () => getFilmContentMobile(id),
       
    });
}

export function useGetSimilarFilms(id: String) {
    return useQuery({
        queryKey: ["similar", id],
        queryFn: () => getSimilarFilms(id),
       
    });
}

export function useGetWatchList(id: String) {
    return useQuery({
        queryKey: ["watchlist", id],
        queryFn: () => getUserWatchList(id),
    })
}

export function useGetPurchaseList(id: String) {
    return useQuery({
        queryKey: ["purchaselist", id],
        queryFn: () => getUserPurchaseList(id)
    })
}

export function useGetVideoSource(id: String) {
    return useQuery({
        queryKey: ["videosource", id],
        queryFn: () => getVideoSourceFilm(id)
    })
}