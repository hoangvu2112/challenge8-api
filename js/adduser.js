function redirectToUserList() {
  window.location.href = "/userlist.html";
}
document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");

  if (!signupForm) {
    console.error("Không tìm thấy form đăng ký trong DOM.");
    return;
  }

  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const requestBody = {
      username: name,
      email: email,
      password: password,
    };

    const url =
      "https://crudnodejs-production.up.railway.app/api/users/register";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        const userId = result.id;
        localStorage.setItem("userId", userId);
        alert("Đăng ký thành công! ID của bạn đã được lưu.");
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
      alert("Không thể kết nối với server!");
    }
  });
});
