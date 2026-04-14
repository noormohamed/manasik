import Navbar from "@/components/Layout/Navbar";
import RegisterForm from "@/components/Authentication/RegisterForm";
 
export default function RegisterPage() {
  return (
    <>
      <Navbar />
      
      <div className="login-register-area ptb-175">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
