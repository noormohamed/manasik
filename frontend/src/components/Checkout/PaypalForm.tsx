"use client";

const PaypalForm = () => {
  return (
    <>
      <form className="checkout-form">
        <div className="row">
          <div className="col-lg-12">
            <div className="form-group mb-4">
              <label>Card number</label>
              <input
                type="number"
                className="form-control"
                placeholder="111 112 222 999"
              />
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-group mb-4">
              <label>Card holder</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name"
              />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="form-group mb-4">
              <label>Expiration date</label>
              <input type="date" className="form-control" />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="form-group mb-4">
              <label>CVC</label>
              <input
                type="text"
                className="form-control" 
              />
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-group mb-4">
              <label>Messager for author</label>
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
              <span>Write a few sentences about yourself.</span>
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

export default PaypalForm;
