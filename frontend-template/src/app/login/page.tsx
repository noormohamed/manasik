import Navbar from "@/components/Layout/Navbar";
import LoginForm from "@/components/Authentication/LoginForm";
 
export default function LoginPage() {
  return (
    <>
      <Navbar />
      
      <div className="login-register-area ptb-175">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
