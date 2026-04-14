"use client";

const CreditCardForm = () => {
  return (
    <>
      <form className="checkout-form">
        <div className="row">
          <div className="col-lg-12">
            <div className="form-group mb-4">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control" 
              />
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-group mb-4">
              <label>Password</label>
              <input
                type="password"
                className="form-control" 
              />
            </div>
          </div>
  
          <div className="col-lg-12">
            <div className="form-group mb-4">
              <label>Messager for Author</label>
              <textarea
                className="form-control"
                placeholder="Something Write"
                cols={30}
                rows={10}
              ></textarea>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-group mb-4">
              <span>Write a few sentences about yourself!</span>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-group mb-0">
              <button type="submit" className="default-btn active border-0">
                Confirm And Pay
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreditCardForm;
