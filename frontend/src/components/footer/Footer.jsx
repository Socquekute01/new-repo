import { MapPin, Phone, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Contact Us Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700">
                            CONTACT US
                        </h3>
                        <div className="space-y-4">
                            {/* Store 1 */}
                            <div className="flex gap-3">
                                <MapPin size={20} className="flex-shrink-0 text-gray-400 mt-1" />
                                <div className="text-sm text-gray-300">
                                    <p className="font-medium mb-1">Store I: 445 Sư Vạn Hạnh, P.12, Q.10.</p>
                                </div>
                            </div>

                            {/* Store 2 */}
                            <div className="flex gap-3">
                                <MapPin size={20} className="flex-shrink-0 text-gray-400 mt-1" />
                                <div className="text-sm text-gray-300">
                                    <p className="font-medium">Store II: TNP 26LTT - 26 Lý Tự Trọng, P.Bến Nghé, Q.1, TP.HCM</p>
                                </div>
                            </div>

                            {/* Store 3 */}
                            <div className="flex gap-3">
                                <MapPin size={20} className="flex-shrink-0 text-gray-400 mt-1" />
                                <div className="text-sm text-gray-300">
                                    <p className="font-medium">Store III: TNP - Tầng B1 Vincom Đồng Khởi, 72 Lê Thánh Tôn, P.Bến Nghé, Q.1, TP.HCM.</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex gap-3">
                                <Phone size={20} className="flex-shrink-0 text-gray-400 mt-1" />
                                <p className="text-sm text-gray-300 font-medium">0123456789</p>
                            </div>
                        </div>
                    </div>

                    {/* About Us Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700">
                            ABOUT US
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li>
                                <a href="#" className="hover:text-white transition-colors duration-200">
                                    Giới thiệu
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors duration-200">
                                    Hướng dẫn mua hàng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors duration-200">
                                    Chính sách đổi trả hàng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors duration-200">
                                    Chính sách giao - nhận
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors duration-200">
                                    Chính sách thanh toán
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors duration-200">
                                    Điều khoản sử dụng website
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors duration-200">
                                    Bảo mật thông tin KH
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Information Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700">
                            THÔNG TIN LIÊN HỆ
                        </h3>
                        <div className="space-y-3 text-sm text-gray-300">
                            <p className="font-medium">- Team2</p>
                            <p>- MST: 0123456789</p>
                            <p className="font-medium">- ĐỊA CHỈ: 110 TRẦN HƯNG ĐẠO, PHƯƠNG 07, QUẬN 5, THÀNH PHỐ HỒ CHÍ MINH, VIỆT NAM</p>
                            <p>- NGÀY CẤP: data</p>
                            <p>- WEBSITE: </p>
                            <p className="font-medium">- FOR BUSINESS:</p>
                            <p>gmail:</p>
                        </div>
                    </div>

                    {/* Follow Us Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700">
                            FOLLOW US
                        </h3>
                        <div className="flex gap-6 mt-8">
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-blue-400 transition-colors duration-200"
                            >
                                <Facebook size={28} />
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-pink-400 transition-colors duration-200"
                            >
                                <Instagram size={28} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400">
                    <p>Needs Of Wisdom® All Rights Reserved...</p>
                </div>
            </div>
        </footer>
    );
}
