import { useState } from "react";
import "../../styles/custom.css";
import path from "../../utils/path";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import { apiForgotPassword } from "../../apis/index";
import { Link, useNavigate } from "react-router-dom";

const paths = {
  Register: path.REGISTER,
  Login: path.LOGIN,
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Email is not in correct format.")
        .required("Email cannot be left blank"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      console.log("Loading state before API call:", loading);
      try {
        const response = await apiForgotPassword({ email: values.email });
        if (response.status === 200) {
          toast.success(
            "A new password has been sent to your email, please check your email!"
          );
          navigate(paths.Login);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error("Email does not exist in the system");
        } else {
          toast.error("An error occurred, please try again");
        }
      } finally {
        console.log("Loading state after API call:", loading);
        setLoading(false);
      }
    },
  });

  return (
    <div className="bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff] flex justify-center w-screen h-screen items-center">
      <div className="h-[500px] w-[90%] md:w-[800px] bg-[#fff] rounded-[30px] overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left section (Form) */}
          <div className="w-full md:w-[50%] h-full flex flex-col items-center justify-center p-4 md:p-0">
            <form
              className="flex flex-col gap-5"
              onSubmit={formik.handleSubmit}
            >
              <h1 className="font-bold text-[24px] md:text-[32px] text-center">
                Forgot password
              </h1>

              <span className="text-center text-[14px] text-[#333]">
                Enter your email account to reset your password
              </span>

              {/* Input Email với Formik */}
              <div className="w-full">
                <input
                  className="bg-[#eee] outline-none px-[16px] py-[10px] w-full md:w-[300px] rounded-[8px] text-[14px] placeholder:text-[#828181] placeholder:text-[14px]"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-red-500 text-sm">{formik.errors.email}</p>
                ) : null}
              </div>

              <div className="text-center text-[#fff] flex flex-col gap-3 justify-center items-center">
                <button
                  type="submit"
                  className={`w-[155px] text-[14px] ${
                    loading ? "bg-[#f2f7f7] text-[#333]" : "!bg-[#512da8]"
                  } bg-transparent border border-white px-12 py-[12px] rounded-[8px] font-medium`}
                  disabled={loading}
                >
                  {loading ? "LOADING..." : "SUBMIT"}
                </button>

                <Link to={paths.Login}>
                  <button className="w-[155px] text-[14px] !bg-[#eae9eb] text-[#333] bg-transparent border border-white py-[12px] rounded-[8px] font-medium block md:hidden">
                    SIGN IN
                  </button>
                </Link>
              </div>
            </form>
          </div>

          {/* Right section (Info) */}
          <div className="w-full md:w-[50%] h-full bg-gradient-to-r from-[#5c6bc0] to-[#512da8] text-[#fff] flex flex-col gap-4 items-center justify-center rounded-none md:rounded-tl-custom-lg md:rounded-bl-custom-lg p-4 hidden md:flex">
            <h1 className="text-[24px] md:text-[32px] font-bold">
              Hello, Friend!
            </h1>
            <div className="m-4 md:m-2 font-light leading-6 text-center">
              If you already have an account, click log in
            </div>
            <Link to={paths.Login}>
              <button className="w-[155px] text-[14px] bg-transparent border border-white px-8 py-[11px] rounded-[8px] font-medium">
                SIGN IN
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
