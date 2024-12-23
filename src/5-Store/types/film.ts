


export interface FilmData {
    title: String;
    type: String;
    audioLanguages: String;
    embeddedSubtitles: String;
    subtitleLanguage: String;
    yearOfProduction: String;
    tags: Array<String>;
    genre: Array<String>; 
    overview: String;
    plotSummary: String;
}



/** getfilms */
export interface GetAllFilms {
    title: String;
    type: String;
    audioLanguages: String;
    embeddedSubtitles: String;
    subtitleLanguage: String;
    yearOfProduction: String;
    tags: Array<String>;
    genre: Array<String>; 
    overview: String;
    plotSummary: String;
}




export interface GetSingleFilmResponse {
    
    title: String;
    type: String;
    audioLanguages: String;
    embeddedSubtitles: String;
    subtitleLanguage: String;
    yearOfProduction: String;
    tags: Array<String>;
    genre: Array<String>; 
    overview: String;
    plotSummary: String;
    

}

