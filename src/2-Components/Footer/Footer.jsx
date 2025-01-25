import React from "react";
// import { BsTwitterX } from "react-icons/bs";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-[#18151c] w-full py-16 px-12 lg:px-[86px] overflow-hidden">
      <div className="max-w-[1240px] mx-auto grid lg:grid-cols-5 gap-8 text-gray-300">
        <div className="flex flex-col gap-[20px] text-center mx-auto lg:text-left lg:col-span-2">
          <h1 className="text-[18px] font-[Inter-Bold] text-[#F2F2F2] tracking-wide">
          <a href="https://alero.co.ke/case-studies/nyati-motion-pictures" target="_blank">Nyati Motion Pictures</a>
          </h1>
          <p className="text-[#8b8789] font-[Inter-Regular] text-[14px] md:w-[400px] lg:w-[70%]">
            Nyati Motion Pictures (NMP) is a Ugandan film and video production
            company established in 2005 with a focus on the East African market.
          </p>
          <div
            spacing={"8px"}
            className="flex flex-col gap-[8px] text-[#F2F2F2] font-[Inter-Medium] text-[16px]"
          >
            <div>+256 778 787 660 </div>
            <div>P.o Box 74733, Wakiso </div>
            <div>
              info@nyatimotionpictures.com <br /> nyatimotionpictures@gmail.com <br /> tukopamojafilm@gmail.com
            </div>
          </div>
        </div>

        {/* Watch Footer Section */}
        {/* <div className="flex flex-col gap-[20px] text-center mx-auto lg:text-left select-none">
          {" "}
          <h1 className="text-[18px] font-[Inter-Bold] text-[#F2F2F2] tracking-wide">
            Watch
          </h1>
          <div className="flex flex-col gap-4">
            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <NavLink to="/film/6653925ab30afd15ac294f7a">
              Tuko Pamoja
              </NavLink>
              
            </div>
            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <NavLink to="/film/665383c3b30afd15ac294f79">
                Fate(2006)
              </NavLink>
            
            </div>
            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <NavLink to="/film/66504774b30afd15ac294f77">
                Fair Play{" "}
              </NavLink>
            
            </div>
            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <NavLink to="/film/6653809ab30afd15ac294f78">
                <span>
                  Windows of Hope (2011){" "}
                </span>
             
              </NavLink>
           
            </div>
            
          </div>
        </div> */}

        {/* About Section */}
        <div className="flex flex-col gap-[20px] text-center mx-auto lg:text-left select-none">
          {" "}
          <h1 className="text-[18px] font-[Inter-Bold] text-[#F2F2F2] tracking-wide">
            About
          </h1>
          <div className="flex flex-col gap-4">
            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <a href="https://nyatimotionpictures.com/about">
                <span className="hover:text-[#dcdbdc]">Company</span>
              </a>
            </div>

            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <a href="https://nyatimotionpictures.com/team">
                <span className="hover:text-[#dcdbdc]">Team</span>
              </a>
            </div>

            {/* <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <NavLink to="/film">
                <span className="hover:text-[#dcdbdc]">
                 In Theatre
                </span>
              </NavLink>
            </div> */}
           
            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <a href="https://nyatimotionpictures.com/contact">
                <span className="hover:text-[#dcdbdc]">Contact Us</span>
              </a>
            </div>

            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <a href="https://nyatimotionpictures.com/internetarchive">
                <span className="hover:text-[#dcdbdc]">Archives</span>
              </a>
            </div>

            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px]">
              <a href="https://nyatimotionpictures.com/policies/termsofservice">
                <span className="hover:text-[#dcdbdc]">Terms & Policies</span>
              </a>
            </div>
          
          </div>
        </div>
        {
          /** 
           *  <div className="flex flex-col gap-[20px] text-center mx-auto lg:text-left select-none">
          {" "}
          <h1 className="text-[18px] font-[Inter-Bold] text-[#F2F2F2] tracking-wide">
            Explore
          </h1>
          <div className="flex flex-col gap-4 select-none">
            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px] cursor-pointer">
              Upcoming Events{" "}
            </div>
            <div className="text-[#8b8789] font-[Inter-Medium] text-[16px] cursor-pointer">
              Ongoing Projects{" "}
            </div>         
          </div>
        </div>
           * 
           * 
           */
        }
       
      </div>
      <div className="max-w-[1240px] mx-auto mt-10 flex justify-center lg:justify-start">
        <div onClick={() => window.location.href ="https://x.com/NyatiMPictures"} className=" flex items w-max max-auto text-[#F2F2F2] gap-[30px]">
          {/* <BsTwitterX size={22} /> */}
          <span className="icon-[fa6-brands--square-x-twitter]" ></span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
