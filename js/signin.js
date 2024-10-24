document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  if (!loginForm) {
    console.error("Không tìm thấy form đăng nhập trong DOM.");
    return;
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Tạo request body
    const requestBody = {
      email: email,
      password: password,
    };

    // URL của API
    const url = "https://crudnodejs-production.up.railway.app/api/users/login";

    try {
      // Gửi yêu cầu POST đến API
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Kiểm tra phản hồi từ server
      const result = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", result);

      if (response.status === 200) {
        // Giả sử phản hồi chứa { id: '123', token: 'your_jwt_token' }
        const userId = result.id;
        const token = result.token;

        // Lưu ID và token vào Local Storage
        localStorage.setItem("userId", userId);
        localStorage.setItem("authToken", token);

        alert("Đăng nhập thành công!");
        // Chuyển hướng đến trang dashboard hoặc trang khác sau khi đăng nhập thành công
        window.location.href = "/dashboard.html"; // Đổi URL này thành trang đích bạn muốn
      } else {
        alert(result.message || "Sai email hoặc mật khẩu!");
      }
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
      alert("Không thể kết nối với server!");
    }
  });
});
