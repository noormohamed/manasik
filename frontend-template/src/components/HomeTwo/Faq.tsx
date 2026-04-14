"use client";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import Image from "next/image";

import faqImg from "/public/images/faq-img.jpg";
import mokaup from "/public/images/mokaup/mokup-7.png";
import shape from "/public/images/shape/shape-13.png";

const Faq = () => {
  return (
    <>
      <div className="faq-area bg-color-f3f4f6 pt-175 pb-150">
        <div className="container">
          <div className="row justify-content-center">
            <div 
              className="col-lg-6"
            >
              <div className="faq-content">
                <span className="top-title">FAQ</span>
                <h2>Need To Ask Some Question</h2>
              </div>

              <div className="faq-accordion-wrap">
                <Accordion preExpanded={["a"]}>
                  <AccordionItem uuid="a">
                    <AccordionItemHeading>
                      <AccordionItemButton>
                        <span>How can I post my house for sale?</span>
                      </AccordionItemButton>
                    </AccordionItemHeading>

                    <AccordionItemPanel>
                      <p>
                        Lorem ipsum dolor sit amet consectetuer adipiscing elit
                        diam non nibh euismod tincidunt ut laoreet dolore magna
                        aliquam erat volutpat ut wisi enim veniam lorem dolore
                        magna aliqua
                      </p>
                    </AccordionItemPanel>
                  </AccordionItem>

                  <AccordionItem uuid="b">
                    <AccordionItemHeading>
                      <AccordionItemButton>
                        <span>Which type of houses do you take for promoting?</span>
                      </AccordionItemButton>
                    </AccordionItemHeading>

                    <AccordionItemPanel>
                      <p>
                        Lorem ipsum dolor sit amet consectetuer adipiscing elit
                        diam non nibh euismod tincidunt ut laoreet dolore magna
                        aliquam erat volutpat ut wisi enim veniam lorem dolore
                        magna aliqua
                      </p>
                    </AccordionItemPanel>
                  </AccordionItem>

                  <AccordionItem uuid="c">
                    <AccordionItemHeading>
                      <AccordionItemButton>
                        <span>What is your realtor sale commission?</span>
                      </AccordionItemButton>
                    </AccordionItemHeading>

                    <AccordionItemPanel>
                      <p>
                        Lorem ipsum dolor sit amet consectetuer adipiscing elit
                        diam non nibh euismod tincidunt ut laoreet dolore magna
                        aliquam erat volutpat ut wisi enim veniam lorem dolore
                        magna aliqua
                      </p>
                    </AccordionItemPanel>
                  </AccordionItem>

                  <AccordionItem uuid="d">
                    <AccordionItemHeading>
                      <AccordionItemButton>
                        <span>Can I sell a house with a current mortgage?</span>
                      </AccordionItemButton>
                    </AccordionItemHeading>

                    <AccordionItemPanel>
                      <p>
                        Lorem ipsum dolor sit amet consectetuer adipiscing elit
                        diam non nibh euismod tincidunt ut laoreet dolore magna
                        aliquam erat volutpat ut wisi enim veniam lorem dolore
                        magna aliqua
                      </p>
                    </AccordionItemPanel>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div 
              className="col-lg-6"
            >
              <div className="faq-img mb-4 mb-lg-0 position-relative">
                <Image src={faqImg} alt="faq" />
                <Image
                  src={mokaup}
                  className="mokup-7 position-absolute top-0 start-0 end-0 w-100 h-100"
                  alt="mokup-7"
                />
                <Image src={shape} className="shape shape-13" alt="shape-13" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
