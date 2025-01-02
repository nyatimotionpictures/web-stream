//register
//login
import { AxiosError } from "axios";
import apiRequest from "../../../3-Middleware/apiRequest";
import {
  UserLoginRequest,
  UserLoginResponse,
  UserLogoutRequest,
  UserLogoutResponse,
  UserRegisterRequest,
  UserRegisterResponse,
} from "../../types/auth";
import { ErrorResponse } from "../../types/generals";
import {
  
  GetAllFilms,

  GetSingleFilmResponse,
} from "../../types/film";
{
  /** /studio */
}

/** Authorization */
/** mutation: User Registration : working as expected - user */
export const postUserRegister = async (
  UserData: UserRegisterRequest
): Promise<UserRegisterResponse> => {
  try {
    const response = await apiRequest.post<UserRegisterResponse>(
      "/v1/user/register",
      UserData
    );
    //console.log("response", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;

    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
};

/** mutation: User Send OTP : working as expected - user */
export const postSendOtp = async (
  OtpData: any
) => {
  try {
    const response = await apiRequest.post(
      "/v1/user/sendotp",
      OtpData
    );
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;

    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
};

/** mutation: User Verify OTP : working as expected - user */
export const verifyOtp = async (OtpData: any) => {
  try {
    const response = await apiRequest.post(
      "/v1/user/verifyotp", OtpData
    );
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;

    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }   
}

/** mutation: User Login : working as expected - user */
export const postAuthLogin = async (
  UserLoginData: UserLoginRequest
): Promise<UserLoginResponse> => {
  try {
    const response = await apiRequest.post<UserLoginResponse>(
      "/v1/user/login",
      UserLoginData
    );
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.log("error");
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
};

/** mutation: User Logout : working as expected - user */
export const postAuthLogout = async (
  UserId: UserLogoutRequest
): Promise<UserLogoutResponse> => {
  try {
    const response = await apiRequest.post<UserLogoutResponse>(
      `/v1/user/logout/${UserId}`
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
};

/** edit - User details */
export const putUpdateUser = async (userdata: any) => {
  try {
    let {id, ...rest} = userdata
    const response = await apiRequest.put(
      `/v1/user/${id}`, rest
    );

    return response.data;
  } catch (error) {
    
  }
}


/** Films */
/** query: Get Single Film : working as expected - GET SINGLE FILM - user */
export const getFilmContent = async (
  filmId: String
): Promise<GetSingleFilmResponse> => {
  try {
    const response = await apiRequest.get<GetSingleFilmResponse>(
      `/v1/film/${filmId}`
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
};

/** query: Get All Films : working as expected - GET ALL FILMS - user */
export const getAllFilms = async () => {
  try {
    const response = await apiRequest.get<GetAllFilms[]>(`/v1/film/all`);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
};



/** query: Get purchases of user - new-not tested with data */

export const getUserPurchaseList = async (UserId: String) => {
  try {
      const response = await apiRequest.get(`/v1/film/watchlist/${UserId}`);

      return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
}

/** like rate */
export const rateLikesFilm = async (likeContent: any) => {
  try {
    let {filmId, userId, ...rest} = likeContent;
    const response = await apiRequest.put(`/v1/film/likerate/${filmId}/${userId}`, rest); 
    return response.data
    
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
}

/** add to watchlist - working as expected */
export const postAddToWatchlist = async (watchlistContent: any) => {
  try {
    let {filmId, userId, ...rest} = watchlistContent;
    const response = await apiRequest.post(`/v1/film/watchlist/${filmId}/${userId}`, rest); 
    return response.data
    
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
}

/** remove from watchlist - not working as expected : remind newton to fix */
export const removeFromWatchlist = async (watchlistContent: any) => {
  try {
    let {filmId, userId, ...rest} = watchlistContent;
    const response = await apiRequest.delete(`/v1/film/watchlist/${filmId}/${userId}`, rest); 
    return response.data
    
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
}

/** query: Get watchlist of user - working as expected - user */
export const getUserWatchList = async (UserId: String) => {
  try {
      const response = await apiRequest.get(`/v1/film/watchlist/${UserId}`);

      return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
}

/** query: get similar films - not working - remind newton */
export const getSimilarFilms = async (filmId: String) => {
  try {
      const response = await apiRequest.get(`/v1/film/similar/${filmId}`);  
      return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
}

/** query for film video source - not working as expected */
export const getVideoSourceFilm = async (trackId: String) => {
  try {
      const response = await apiRequest.get(`/v1/film/track/${trackId}`);  
      return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
}

/** make film payment */
export const makeFilmPurchase = async (paymentData: any) => {
  try {
    let {videoId, userId, ...rest} = paymentData;
    const response = await apiRequest.post(`/v1/film/purchase/${userId}/${videoId}`, rest);
    return response.data
    
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
} 
