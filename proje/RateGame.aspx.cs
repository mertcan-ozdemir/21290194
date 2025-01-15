using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Script.Serialization;
using System.Web.Services;

namespace proje
{
    public partial class RateGame : System.Web.UI.Page
    {
        [WebMethod]
        public static string SubmitRating(string game_name, int rating)
        {
            string connectionString = "Server=LAPTOP-ILM2R7E6;Database=proje;Integrated Security=True;";
            string response = "";

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // Puanı veritabanına ekle
                    string insertQuery = "INSERT INTO ratings (game_name, rating) VALUES (@game_name, @rating)";
                    using (SqlCommand cmd = new SqlCommand(insertQuery, conn))
                    {
                        cmd.Parameters.AddWithValue("@game_name", game_name);
                        cmd.Parameters.AddWithValue("@rating", rating);
                        cmd.ExecuteNonQuery();
                    }

                    // Ortalama puanı ve toplam oy sayısını hesapla
                    string selectQuery = "SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_votes FROM ratings WHERE game_name = @game_name";
                    using (SqlCommand cmd = new SqlCommand(selectQuery, conn))
                    {
                        cmd.Parameters.AddWithValue("@game_name", game_name);
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                double averageRating = Convert.ToDouble(reader["avg_rating"]);
                                int totalVotes = Convert.ToInt32(reader["total_votes"]);

                                var result = new
                                {
                                    success = true,
                                    average_rating = averageRating.ToString("0.0"),
                                    total_votes = totalVotes
                                };

                                response = new JavaScriptSerializer().Serialize(result);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                var result = new { success = false, error = ex.Message };
                response = new JavaScriptSerializer().Serialize(result);
            }

            return response;
        }

        [WebMethod]
        public static string GetRating(string game_name)
        {
            string connectionString = "Server=LAPTOP-ILM2R7E6;Database=proje;Integrated Security=True;";
            string response = "";

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string selectQuery = "SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_votes FROM ratings WHERE game_name = @game_name";
                    using (SqlCommand cmd = new SqlCommand(selectQuery, conn))
                    {
                        cmd.Parameters.AddWithValue("@game_name", game_name);
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                double averageRating = reader["avg_rating"] != DBNull.Value ? Convert.ToDouble(reader["avg_rating"]) : 0.0;
                                int totalVotes = Convert.ToInt32(reader["total_votes"]);

                                var result = new
                                {
                                    success = true,
                                    average_rating = averageRating.ToString("0.0"),
                                    total_votes = totalVotes
                                };

                                response = new JavaScriptSerializer().Serialize(result);
                            }
                            else
                            {
                                var result = new { success = true, average_rating = "0.0", total_votes = 0 };
                                response = new JavaScriptSerializer().Serialize(result);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                var result = new { success = false, error = ex.Message };
                response = new JavaScriptSerializer().Serialize(result);
            }

            return response;
        }
    }
}
