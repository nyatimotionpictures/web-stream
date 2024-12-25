import { useMemo, useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Login from './6-Views/Studio/studio-auth/Login.jsx';
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import { StyledEngineProvider } from "@mui/material/styles";
import OrdinaryRoutes from "./4-Routes/OrdinaryRoutes.jsx";
import ProtectedRoutes from "./4-Routes/ProtectedRoutes.jsx";

// import Register from './6-Views/Studio/studio-auth/Register.jsx';
import Register from "./6-Views/Auth/Register.jsx";
import VerifyPassKey from "./6-Views/Auth/VerifyPassKey.jsx";
import Login from "./6-Views/Auth/Login.jsx";
import RegisterSuccess from "./6-Views/Auth/RegisterSuccess.jsx";
import UserHome from "./6-Views/User-Views/1UserHome/UserHome.jsx";
import UFilmDetailPage from "./6-Views/User-Views/2UserViewFilm/UFilmDetailPage.jsx";
import FilmPayment from "./6-Views/User-Views/8UserPay/FilmPayment.jsx";
import PaymentValidation from "./6-Views/User-Views/9PaymentValidations/PaymentValidation.jsx";
import BrowsePage from "./6-Views/User-Views/11BrowseFilm/BrowsePage.jsx";
import UWatchList from "./6-Views/User-Views/4UserWatchList/UWatchList.jsx";
import UPurchaseList from "./6-Views/User-Views/5UserPurchases/UPurchaseList.jsx";
import YourAccountPage from "./6-Views/User-Views/6UAccountSettings/YourAccountPage.jsx";
import UViewActivity from "./6-Views/User-Views/7UActivity/UViewActivity.jsx";
import SearchAll from "./6-Views/User-Views/12UFilmSearchPages/SearchAll.jsx";
import SearchFilms from "./6-Views/User-Views/12UFilmSearchPages/SearchFilms.jsx";
import SearchShows from "./6-Views/User-Views/12UFilmSearchPages/SearchShows.jsx";
import UWatchFilm from "./6-Views/User-Views/3UserWatchFilm/UWatchFilm.jsx";

function App() {
  let theme = useMemo(() => createTheme(themeSettings), []);
  return (
    <StyledEngineProvider injectFirst>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route
              // element={<ProtectedRoutes />}
              element={<OrdinaryRoutes />}
            >
              <Route path="/" element={<UserHome />} />
              <Route path="/film/:id" element={<UFilmDetailPage />} />
              <Route path="/series/:id" element={<UFilmDetailPage />} />
              <Route path="/episode/:id" element={<UFilmDetailPage />} />
              <Route path="/payment" element={<FilmPayment />} />
              <Route
                path="/payment/validate/:orderTrackingId"
                element={<PaymentValidation />}
              />

              <Route path="/ufilm/:hfdfh/watch" element={<UWatchFilm />} />

              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/browse/genre/all" element={<SearchAll />} />
              <Route path="/browse/genre/movies" element={<SearchFilms />} />
              <Route path="/browse/genre/shows" element={<SearchShows />} />
              <Route path="/mylist/watchlist" element={<UWatchList />} />

              <Route
                path="/mylist/purchases&rentals"
                element={<UPurchaseList />}
              />

              <Route path="/account" element={<YourAccountPage />} />

              <Route path="/settings/activity" element={<UViewActivity />} />

              {/*              

            <Route
              path="/auth/reset"
              element={<Verification />}
              errorElement={<ErrorPage />}
            />
          
            */}
            </Route>

            <Route element={<OrdinaryRoutes />}>
              {/* <Route path="/login" element={<Login />} /> */}
              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />

              <Route path="/verifyaccount" element={<VerifyPassKey />} />
              <Route path="/success" element={<RegisterSuccess />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </StyledEngineProvider>
  );
}

export default App;
