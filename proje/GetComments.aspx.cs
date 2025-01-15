using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace proje
{
    public partial class GetComments : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // gameId parametresini URL'den al
            string gameIdParam = Request.QueryString["gameId"];
            if (string.IsNullOrEmpty(gameIdParam))
            {
                Response.StatusCode = 400; // Bad Request
                Response.Write("Game ID is missing or invalid.");
                Response.End();
                return;
            }

            int gameId;
            if (!int.TryParse(gameIdParam, out gameId))
            {
                Response.StatusCode = 400; // Bad Request
                Response.Write("Game ID is invalid.");
                Response.End();
                return;
            }

            // Veritabanından yorumları getir
            string connectionString = "Server=LAPTOP-ILM2R7E6;Database=proje;Integrated Security=True;";
            List<object> comments = new List<object>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand(
                    "SELECT username, comment, created_at FROM GameComments WHERE gameId = @gameId ORDER BY created_at DESC",
                    conn);
                cmd.Parameters.AddWithValue("@gameId", gameId);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        comments.Add(new
                        {
                            username = reader["username"].ToString(),
                            comment = reader["comment"].ToString(),
                            created_at = Convert.ToDateTime(reader["created_at"]).ToString("yyyy-MM-ddTHH:mm:ssZ") // ISO 8601 formatı
                        });
                    }
                }
            }

            // JSON olarak döndür
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            string json = serializer.Serialize(comments);

            Response.ContentType = "application/json";
            Response.Write(json);
            Response.End();
        }
    }
}