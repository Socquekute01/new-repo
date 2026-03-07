import jwt from "jsonwebtoken";

// Middleware để xác thực JWT token
export const authenticateToken = (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực. Vui lòng đăng nhập.",
      });
    }

    // Verify token
    jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn",
          });
        }

        // Lưu user info vào request để sử dụng ở các route tiếp theo
        req.user = { userId: decoded.userId };
        req.userId = decoded.userId;
        next();
      },
    );
  } catch (error) {
    console.error("Lỗi khi xác thực token:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực",
    });
  }
};
