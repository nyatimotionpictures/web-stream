//register
//login
import axios, { AxiosError } from "axios";
import apiRequest, { BaseUrl } from "../../../3-Middleware/apiRequest";
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
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}. ${error.response?.data?.message}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};

/** mutation: User Send OTP : working as expected - user */
export const postSendOtp = async (
  OtpData: any
) => {
  try {
    const response = await axios.post(
      `${BaseUrl}/v1/user/sendotp`,
      OtpData
    );
    
    return response.data;
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}. ${error.response?.data?.message}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};

/** mutation: User Verify OTP : working as expected - user */
export const verifyOtp = async (OtpData: any) => {
  try {
    const response = await axios.post(
      `${BaseUrl}/v1/user/verifyotp`, OtpData, {
        headers: {
          Authorization: `Bearer ${OtpData?.otpToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data;
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}. ${error.response?.data?.message}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
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
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}. ${error.response?.data?.message}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};

/** mutation: User Reset Password : working as expected - user */
export const postAuthReset = async (
  UserResetData: any
) => {
  let {authToken, ...rest} = UserResetData;
  try {
    const response = await axios.post(
      `${BaseUrl}/v1/user/forgot-password`,
      {...rest},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data;
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}. ${error.response?.data?.message}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
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
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
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
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
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
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};

/** Mobile Application: Get Single Film Response */
export const getFilmContentMobile = async (
  filmId: String
): Promise<GetSingleFilmResponse> => {
  try {
    const response = await axios.get<GetSingleFilmResponse>(
      `${BaseUrl}/v1/film/${filmId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Mb_token")}`,
      }
    }
    );

    return response.data;
  } catch (error) {
    if(error.response?.status === 401){
      //token expiration
      localStorage.removeItem("Mb_token");
     throw {message: "Session expired. Please login again."}
    
  }else if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};

/** query: Get All Films : working as expected - GET ALL FILMS - user */
export const getAllFilms = async () => {
  try {
    const response = await apiRequest.get<GetAllFilms[]>(`/v1/film/all`);

    return response.data;
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};

/** query: Fetch all Seasons  */
export const getAllSeasons = async () => {
  try {
    const response = await apiRequest.get(`/v1/film/season/all`);

    return response.data;
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};

/** query: Fetch Single Season */
export const getSeasonContent = async (seasonId: String) => {
  try {
    const response = await apiRequest.get(`/v1/film/season/${seasonId}`);

    return response.data;
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};

export const getSeasonContentMobile = async (seasonId: String) => {
  try {
    const response = await axios.get(`${BaseUrl}/v1/film/season/${seasonId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("Mb_token")}`,
      }
    });

    return response.data;
  } catch (error) {
    if(error.response?.status === 401){
      //token expiration
      localStorage.removeItem("Mb_token");
     throw {message: "Session expired. Please login again."}
    
  } else if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
};



/** query: Get purchases of user - new-not tested with data */

export const getUserPurchaseList = async (UserId: String) => {
  try {
      const response = await apiRequest.get(`/v1/film/purchaselist/${UserId}`);

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
    const response = await apiRequest.post(`/v1/film/likerate`, likeContent); 
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
    const response = await apiRequest.post(`/v1/film/watchlist/add`, watchlistContent); 
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

/** Donations on streaming site */
/** make general Donations on streaming site */
export const makeGeneralDonation = async (paymentData: any) => {
  try {
    let { payType,...rest} = paymentData;
    const response = await apiRequest.post(`/v1/payment/${payType}/donate`, rest);
    return response.data
    
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
}

/** get general donation status */
export const getGeneralDonationStatus = async (
  orderId: string
) => {
  try {
    // console.log("orderId", orderId);
    let token = localStorage.getItem("token");
    const response = await axios.get(
    `${BaseUrl}/v1/payment/mtn/transact_statuses/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
    );
  
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;

    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
};

/** make film Donation Payment */
export const makeFilmDonation = async (paymentData: any) => {
  try {
    let {filmId, userId, ...rest} = paymentData;
    const response = await apiRequest.post(`/v1/film/donate/${userId}/${filmId}`, rest);
    return response.data
    
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
}



/** make film payment */
export const makeFilmPurchase = async (paymentData: any) => {
  try {
    
    const response = await apiRequest.post(`/v1/film/purchase`, paymentData);
    return response.data
    
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
} 

export const getPaymentStatus = async (
  orderId: string
) => {
  try {
    // console.log("orderId", orderId);
    let token = localStorage.getItem("token");
    const response = await axios.get(
    `${BaseUrl}/v1/film/checkpaymentstatus/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
    );
  
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;

    throw axiosError.response?.data ?? { message: "An unknown error occurred" };
  }
};

/** query: Get Categories */

export const getAllCategories = async () => {
  try {
    const response = await apiRequest.get(
      "/v1/studio/categories"
    );


    return response.data;
  } catch (error) {
    if (error?.response) {
      throw {message: `Error ${error.response.status}: ${error.response.statusText}`}
     
    } else if (error.request) {
      throw {message: "No response from server. Please check your network connection."}
      
    } else {
      throw {message: `Request failed: ${error.message}`}
     
    }
  }
}