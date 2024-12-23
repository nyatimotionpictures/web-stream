
//request
export interface UserLoginRequest {
  email: String;
  password: String;
} 

export interface UserRegisterRequest {
  email: String;
  password: String;
  firstname: String;
  lastname: String;
  phoneNumber: String;
 
}

export interface UserLogoutRequest {
  id: String;
}

//Responses
 interface User {
  email: String;
  password: String;
  firstname: String;
  lastname: String;
  privileges: String;
  role: String;
  phoneNumber: String;
  createdDate: String;
}

export interface UserLoginResponse {
  User: User;
  token: String;
}

export interface UserRegisterResponse {
  message: String;
}

export interface UserLogoutResponse {
  message: String;
}