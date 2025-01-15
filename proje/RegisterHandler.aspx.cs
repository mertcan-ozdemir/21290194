using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace proje
{
    using System;
    using System.Data.SqlClient;

    public partial class RegisterHandler : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Yalnızca POST isteklerini kabul et
            if (Request.HttpMethod == "POST")
            {
                string email = Request.Form["email"];
                string username = Request.Form["name"];
                string password = Request.Form["password"];

                // Veritabanı bağlantısı ve kullanıcı kaydı
                string connectionString = "Server=LAPTOP-ILM2R7E6;Database=proje;Integrated Security=True;";
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    // Kullanıcı zaten var mı kontrol et
                    string checkQuery = "SELECT COUNT(*) FROM kullanici WHERE Email = @Email OR Username = @Username";
                    SqlCommand checkCommand = new SqlCommand(checkQuery, connection);
                    checkCommand.Parameters.AddWithValue("@Email", email);
                    checkCommand.Parameters.AddWithValue("@Username", username);
                    int userCount = (int)checkCommand.ExecuteScalar();

                    if (userCount > 0)
                    {
                        Response.Write("<script>alert('Username or email already exists.'); window.location='main/signup.html';</script>");
                        return;
                    }
                    // Yeni kullanıcı ekle
                    string insertQuery = "INSERT INTO kullanici (Email, Username, Password) VALUES (@Email, @Username, @Password)";
                    SqlCommand insertCommand = new SqlCommand(insertQuery, connection);
                    insertCommand.Parameters.AddWithValue("@Email", email);
                    insertCommand.Parameters.AddWithValue("@Username", username);
                    insertCommand.Parameters.AddWithValue("@Password", password); // Şifreyi normal metin olarak kaydediyor

                    insertCommand.ExecuteNonQuery();
                    Response.Write("<script>alert('User created successfully!'); window.location='main/login.html';</script>");
                }
            }
            else
            {
                Response.Redirect("main/signup.html");
            }
        }
    }

}