using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace proje
{
    public partial class DeleteComment : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Sayfa yüklendiğinde yapılacak bir işlem yok
        }

        [WebMethod]
        public static object DeleteComment2(string username, string gameId, string comment)
        {
            string connectionString = "Server=LAPTOP-ILM2R7E6;Database=proje;Integrated Security=True;";

            bool isAdmin = username.ToLower() == "admin"; // Sadece "admin" kullanıcısı yetkili

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string query;

                    if (isAdmin)
                    {
                        // "admin" kullanıcısı herhangi bir yorumu silebilir
                        query = @"
                DELETE FROM GameComments
                WHERE gameId = @gameId 
                  AND comment = @comment";
                    }
                    else
                    {
                        // Normal kullanıcı sadece kendi yorumunu silebilir
                        query = @"
                DELETE FROM GameComments
                WHERE gameId = @gameId 
                  AND username = @username 
                  AND comment = @comment";
                    }

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@gameId", gameId);
                        cmd.Parameters.AddWithValue("@comment", comment);

                        if (!isAdmin)
                        {
                            cmd.Parameters.AddWithValue("@username", username);
                        }

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return new { status = "success", message = "Comment deleted successfully." };
                        }
                        else
                        {
                            return new { status = "failure", message = "No matching record found." };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return new { status = "error", message = ex.Message };
            }
        }


    }
}