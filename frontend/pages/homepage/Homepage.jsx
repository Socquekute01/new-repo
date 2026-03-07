import Header from "../../src/components/header/Header";
import Navigate from "../../src/components/navigate/Navigate";
import Card from "../../src/components/card/Card";
import Footer from "../../src/components/footer/Footer";
import ChatbotWidget from "../../src/components/chatbot/ChatbotWidget";

export default function Homepage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <Header />

      {/* Banner/Navigate Slider */}
      <Navigate />

      {/* Featured/Collaboration Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Collaboration
            </h2>
            <p className="text-lg text-gray-600">
              Discover our exclusive collections with world-renowned artists
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <Card />
      </section>

      {/*{/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-gray-600">
                On orders over $50. Fast and reliable delivery to your doorstep.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                100% Authentic
              </h3>
              <p className="text-gray-600">
                All products are guaranteed to be 100% authentic and original.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Easy Returns
              </h3>
              <p className="text-gray-600">
                30-day return policy. Shop with confidence knowing you can
                return anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <ChatbotWidget />
    </div>
  );
}
