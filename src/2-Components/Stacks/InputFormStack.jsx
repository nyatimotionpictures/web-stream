import { Box } from "@mui/material";
import { border, color, fontSize, height, margin, padding, styled, width } from "@mui/system";

export const SingleWrapper = styled(Box)({
  display: "flex",
});

export const FormContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  gap: "4px",
  
  "&& input": {
    height: "43px",
    background: "#36323e",
    border: "1px solid rgba(238, 241, 244, 0.3)",
    borderRadius: "6px",
    textIndent: "10px",
    width: "100%"
  },

  "&& select": {
    height: "43px",
    background: "#36323e",
    border: "1px solid rgba(238, 241, 244, 0.3)",
    borderRadius: "6px",
    textIndent: "10px",
    
  },
  "&& textarea": {
    minHeight: "72px",
    background: "#36323e",
    textIndent: "10px",
    borderRadius: "6px",
    border: "1px solid rgba(238, 241, 244, 0.3)",
    padding: "5px",
  },
  "&& .textarealg": {
    minHeight: "130px",
    background: "#36323e",
    textIndent: "10px",
    borderRadius: "6px",
    border: "1px solid rgba(238, 241, 244, 0.3)",
    padding: "5px",
  },

  "&& .mulipleselect": {
    minHeight:" 43px !important",
    background: "#36323e",
    border: "1px solid rgba(238, 241, 244, 0.3) !important",
    borderRadius: "6px",
   paddingRight: "10px",
    position: "relative",
    outline: "none",
  
  },
  "&& .MuiInputBase-root": {
    minHeight:" 43px !important",
    padding: "0px !important",
    margin: "0px !important",
    border: "0px !important",
    outline: "none !important",
  },
  
   "&& .MuiFormControl-root": {
    minHeight:" 43px !important",
     width: "100% !important",
     background: "transparent !important",
     textIndent: "0px !important",
     padding: "0px !important",
        margin: "0px !important",
        border: "0px !important",
   },

   
      "&& .MuiAutocomplete-input": {
        height:" 43px !important",
        background: "transparent !important",
        border: "none !important",
        padding: "0px !important",
        color: "white !important",
        fontSize: "14px !important",
       
    
      },
      
    
      "&& .MuiButtonBase-root": {
       background: "white !important",
       color: "black !important",
       fontSize: "14px !important",

      },
      
      "&& .phoneInputContainer2": {
        width: "100% !important"
      }
      ,
      "&& .phoneInput2": {
        width: "100% !important"
      }
             
});
