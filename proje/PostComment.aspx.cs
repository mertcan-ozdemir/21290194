using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace proje
{
    public partial class PostComment : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (Request.HttpMethod == "POST")
            {
                string username = Request.Form["username"];
                string comment = Request.Form["comment"];
                int gameId = Convert.ToInt32(Request.Form["gameId"]); // gameId'yi al

                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(comment) || gameId == 0)
                {
                    Response.StatusCode = 400; // Bad Request
                    Response.Write("Invalid data");
                    Response.End();
                }

                string connectionString = "Server=LAPTOP-ILM2R7E6;Database=proje;Integrated Security=True;";
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    SqlCommand cmd = new SqlCommand(
                        "INSERT INTO GameComments (gameId, username, comment, created_at) VALUES (@gameId, @username, @comment, GETDATE())",
                        conn);
                    cmd.Parameters.AddWithValue("@gameId", gameId);
                    cmd.Parameters.AddWithValue("@username", username);
                    cmd.Parameters.AddWithValue("@comment", comment);

                    cmd.ExecuteNonQuery();

                    Response.StatusCode = 200;
                    Response.Write("Comment added successfully");
                    Response.End();
                }
            }
        }
    }
}