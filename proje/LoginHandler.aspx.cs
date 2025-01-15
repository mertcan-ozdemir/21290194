using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace proje
{
    public partial class LoginHandler : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (Request.HttpMethod == "POST")
            {
                string email = Request.Form["email"];
                string password = Request.Form["password"];

                string connectionString = "Server=LAPTOP-ILM2R7E6;Database=proje;Integrated Security=True;";
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    // Kullanıcıyı ve şifreyi kontrol ederken Username'i de al
                    string query = "SELECT Username FROM kullanici WHERE Email = @Email AND Password = @Password";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", password);

                    object result = command.ExecuteScalar();

                    if (result != null) // Kullanıcı bulundu
                    {
                        string username = result.ToString();
                        // Kullanıcı adını oturuma kaydet
                        Session["UserName"] = username;
                        // Kullanıcı adını localStorage'a eklemek için frontend'e aktar
                        Response.Write("<script>");
                        Response.Write($"localStorage.setItem('username', '{username}');"); // Kullanıcı adı localStorage'da saklanır
                        Response.Write("window.location = '/main/index.html';"); 
                        Response.Write("</script>");
                    }
                    else
                    {
                        Response.Write("<script>alert('Invalid username or password.'); window.location='main/login.html';</script>");
                    }
                }
            }
            else
            {
                Response.Redirect("main/login.html");
            }
        }

    }
}