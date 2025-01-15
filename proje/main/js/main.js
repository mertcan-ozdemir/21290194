'use strict';

(function ($) {

    let mixer;
    const API_KEY = 'f58dcd2920254aae8c9b4983b72b4d71'; 

    document.addEventListener("DOMContentLoaded", () => {
        const username = localStorage.getItem("username");
        if (username) {
            document.getElementById("userGreeting").textContent = `Merhaba, ${username}`;
        }
    });

    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        // Türleri çekip filtre butonlarýný oluþtur
        getGenresAndCreateFilterButtons()
            .then(() => {
                // Oyunlarý çek ve sayfaya ekle
                return getGamesAndRender();
            })
            .then(() => {
                // Oyunlar yüklendikten sonra MixItUp'ý baþlat
                const containerEl = document.querySelector('.trending__product .row');
                if (containerEl) {
                    mixer = mixitup(containerEl, {
                        selectors: {
                            target: '.mix'
                        },
                        animation: {
                            duration: 300
                        }
                    });

                    // Filtre butonlarýna týklanýnca filtre uygula
                    $('.filter__controls').off('click').on('click', 'li', function () {
                        $('.filter__controls li').removeClass('active');
                        $(this).addClass('active');
                        const filterValue = $(this).data('filter');
                        mixer.filter(filterValue);
                    });
                }
            })
            .catch(err => console.error(err));
    });

    function getGenresAndCreateFilterButtons() {
        const GENRES_URL = `https://api.rawg.io/api/genres?key=${API_KEY}`;
        return fetch(GENRES_URL)
            .then(response => response.json())
            .then(data => {
                const genres = data.results;
                const filterControls = document.querySelector('.filter__controls');
                if (!filterControls) return;

                // "All" butonu
                const allButton = document.createElement('li');
                allButton.classList.add('active');
                allButton.setAttribute('data-filter', '*'); // Tümünü gösterir
                allButton.textContent = 'All';
                filterControls.appendChild(allButton);

                // Türleri ekle
                genres.forEach(genre => {
                    const li = document.createElement('li');
                    li.setAttribute('data-filter', `.${genre.slug}`);
                    li.textContent = genre.name;
                    filterControls.appendChild(li);
                });
            });
    }

    function getGamesAndRender() {
        const GAMES_URL = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=40`;
        return fetch(GAMES_URL)
            .then(response => response.json())
            .then(data => {
                const games = data.results;
                const container = document.querySelector('.trending__product .row');
                if (!container) return;

                const gameElements = [];

                games.forEach(game => {
                    const gameItem = document.createElement("div");
                    gameItem.classList.add("col-lg-4", "col-md-6", "col-sm-6", "mix");

                    // Genre class'larýný ekle
                    game.genres.forEach(genre => {
                        gameItem.classList.add(genre.slug);
                    });

                    const bgStyle = game.background_image
                        ? `background-image: url(${game.background_image});`
                        : "";
                    const description = game.description_raw || "No description available";
                    const releaseDate = game.released || "N/A";
                    const metacritic = game.metacritic || "N/A";
                    const genresText = game.genres.map((g) => g.name).join(", ");
                    const wishlists = game.added;

                    // Baðlantýya `id` ekliyoruz
                    gameItem.innerHTML = `
                    <div class="product__item">
                        <div class="product__item__pic" style="${bgStyle}">
                            <div class="ep">Metacritic: ${metacritic}</div>
                            <div class="view"><i class="fa fa-eye"></i> ${wishlists} Wishlists</div>
                        </div>
                        <div class="product__item__text">
                            <h5>
                                <a href="game-details.html?id=${game.id}&name=${encodeURIComponent(game.name)}
                                &image=${encodeURIComponent(game.background_image)}
                                &description=${encodeURIComponent(description)}
                                &release=${encodeURIComponent(releaseDate)}
                                &metacritic=${encodeURIComponent(metacritic)}
                                &genres=${encodeURIComponent(genresText)}
                                &wishlists=${encodeURIComponent(wishlists)}">
                                    ${game.name}
                                </a>
                            </h5>
                        </div>
                    </div>
                `;
                    gameElements.push(gameItem);
                });

                // Oyunlarý DOM'a ekle
                gameElements.forEach((el) => container.appendChild(el));
            });
    }

    function searchGames(event) {
        event.preventDefault();
        const query = document.getElementById('search-input').value.trim();
        if (!query) return;

        const SEARCH_URL = `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(query)}`;

        fetch(SEARCH_URL)
            .then(response => response.json())
            .then(data => {
                const results = data.results;
                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = '';

                if (!results || results.length === 0) {
                    resultsContainer.innerHTML = '<li>No results found</li>';
                    return;
                }

                results.forEach(game => {
                    const resultItem = document.createElement('li');
                    resultItem.style.cursor = 'pointer';
                    resultItem.textContent = game.name;
                    resultItem.addEventListener('click', () => {
                        const description = game.description_raw || 'No description available';
                        const releaseDate = game.released || 'N/A';
                        const metacritic = game.metacritic || 'N/A';
                        const genresText = game.genres.map(g => g.name).join(', ');
                        const wishlists = game.added;

                        window.location.href = `game-details.html?name=${encodeURIComponent(game.name)}&image=${encodeURIComponent(game.background_image)}&description=${encodeURIComponent(description)}&release=${encodeURIComponent(releaseDate)}&metacritic=${encodeURIComponent(metacritic)}&genres=${encodeURIComponent(genresText)}&wishlists=${encodeURIComponent(wishlists)}`;
                    });
                    resultsContainer.appendChild(resultItem);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function logout() {
        localStorage.removeItem("username");
        alert("Çýkýþ yapýldý!");
        window.location.href = "/main/login.html";
    }

    function toggleUserMenu() {
        const username = localStorage.getItem("username");
        if (!username) {
            window.location.href = "/main/login.html";
        } else {
            const userMenu = document.getElementById("userMenu");
            userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
        }
    }

    const searchSwitch = document.querySelector('.search-switch');
    if (searchSwitch) {
        searchSwitch.addEventListener('click', () => {
            document.querySelector('.search-model').style.display = 'block';
            document.getElementById('search-input').focus();
        });
    }

    const searchCloseSwitch = document.querySelector('.search-close-switch');
    if (searchCloseSwitch) {
        searchCloseSwitch.addEventListener('click', () => {
            document.querySelector('.search-model').style.display = 'none';
            document.getElementById('search-results').innerHTML = '';
            document.getElementById('search-input').value = '';
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const gameName = new URLSearchParams(window.location.search).get("name");

        if (gameName) {
            fetch(`/RateGame.aspx/GetRating`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ game_name: gameName })
            })
                .then(response => response.json())
                .then(data => {
                    // ASP.NET'in döndüðü JSON'u iki kez parse et
                    const parsedData = JSON.parse(data.d);

                    if (parsedData.success) {
                        document.getElementById("average-rating").textContent = parsedData.average_rating;
                        document.getElementById("total-votes").textContent = parsedData.total_votes;
                    } else {
                        document.getElementById("average-rating").textContent = "N/A";
                        document.getElementById("total-votes").textContent = "N/A";
                    }
                })
                .catch(error => {
                    console.error("Error fetching initial rating:", error);
                    document.getElementById("average-rating").textContent = "N/A";
                    document.getElementById("total-votes").textContent = "N/A";
                });
        }
    });

    document.getElementById("rating-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const gameName = document.getElementById("game-name").textContent;
        const userRating = document.getElementById("user-rating").value;

        if (!userRating || userRating < 0 || userRating > 100) {
            document.getElementById("rating-feedback").textContent = "Please enter a valid rating between 0 and 100.";
            return;
        }

        // AJAX isteði ile veriyi gönder
        fetch("/RateGame.aspx/SubmitRating", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ game_name: gameName, rating: parseInt(userRating) })
        })
            .then(response => response.json())
            .then(data => {
                // ASP.NET'in döndüðü JSON'u iki kez parse et
                const parsedData = JSON.parse(data.d);
                console.log(parsedData); // Konsolda sonucu kontrol edin

                if (parsedData.success) {
                    document.getElementById("rating-feedback").textContent = "Rating submitted successfully!";
                    document.getElementById("average-rating").textContent = parsedData.average_rating;
                    document.getElementById("total-votes").textContent = parsedData.total_votes;
                } else {
                    document.getElementById("rating-feedback").textContent = `Error: ${parsedData.error}`;
                }
            })
            .catch(error => {
                console.error("Error:", error);
                document.getElementById("rating-feedback").textContent = "An error occurred. Please try again later.";
            });
    });

    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    function loadComments(gameId) {
        fetch(`/GetComments.aspx?gameId=${gameId}`)
            .then((response) => response.json())
            .then((data) => {
                const commentsList = document.getElementById("comments-list");
                commentsList.innerHTML = ""; // Önceki yorumlarý temizle
                const currentUser = localStorage.getItem("username");

                data.forEach((comment) => {
                    const commentItem = document.createElement("div");
                    commentItem.className = "comment-item";
                    commentItem.style.position = "relative";

                    const userAvatar = document.createElement("img");
                    userAvatar.src = "https://via.placeholder.com/50";
                    userAvatar.alt = "User Avatar";

                    const commentContent = document.createElement("div");
                    commentContent.className = "comment-content";

                    const commentHeader = document.createElement("h6");
                    commentHeader.innerHTML = `${comment.username} - <span>${new Date(comment.created_at).toLocaleString()}</span>`;

                    const commentText = document.createElement("p");
                    commentText.textContent = comment.comment;

                    if (currentUser === comment.username || currentUser === "admin") {
                        const deleteButton = document.createElement("button");
                        deleteButton.textContent = "Delete";
                        deleteButton.className = "delete-comment-btn";
                        deleteButton.addEventListener("click", () => {
                            deleteComment(gameId, comment.username, comment.comment);
                        });
                        commentItem.appendChild(deleteButton);
                    }

                    commentContent.appendChild(commentHeader);
                    commentContent.appendChild(commentText);
                    commentItem.appendChild(userAvatar);
                    commentItem.appendChild(commentContent);
                    commentsList.appendChild(commentItem);
                });
            })
            .catch((error) => {
                console.error("Yorumlar yüklenirken bir hata oluþtu:", error);
                alert("Yorumlar yüklenirken bir hata oluþtu!");
            });
    }

    document.getElementById("comment-form").addEventListener("submit", (e) => {
        e.preventDefault(); // Sayfanýn yeniden yüklenmesini engelle

        const commentText = document.getElementById("comment-text").value;
        const username = localStorage.getItem("username");
        const gameId = new URLSearchParams(window.location.search).get("id"); // URL'den id'yi al

        if (!username) {
            alert("You must be logged in to comment.");
            return;
        }

        if (!gameId) {
            alert("Game ID is missing!");
            return;
        }

        fetch("/PostComment.aspx", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `gameId=${gameId}&username=${username}&comment=${commentText}`
        })
            .then((response) => {
                if (response.ok) {
                    document.getElementById("comment-text").value = ""; // Formu temizle
                    loadComments(gameId); // Yorumlarý yeniden yükle
                } else {
                    alert("Failed to add comment");
                }
            })
            .catch((error) => console.error("Error submitting comment:", error));
    });

    document.addEventListener("DOMContentLoaded", () => {
        // URL'den gameId parametresini al
        const gameId = new URLSearchParams(window.location.search).get("id");

        if (!gameId) {
            console.error("Game ID is missing in the URL.");
            return;
        }

        // Yorumlarý yükle
        loadComments(gameId);
    });





    function deleteComment(gameId, username, comment) {
        
        fetch("/DeleteComment.aspx/DeleteComment2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, gameId, comment })
        })
            .then(response => response.json()) // Ýlk parse iþlemi
            .then(data => {
                // ASP.NET'ten dönen JSON'u tekrar parse et
                const parsedData = typeof data.d === "string" ? JSON.parse(data.d) : data.d;

                if (parsedData.status === "success") {
                    alert(parsedData.message); // "Comment deleted successfully." gösterilecek
                    loadComments(gameId); // Yorumlarý yeniden yükle
                } else {
                    alert(`Hata: ${parsedData.message}`);
                }
            })
            .catch(error => {
                console.error("Yorum silinirken bir hata oluþtu:", error);
            });

    }

})(jQuery);
