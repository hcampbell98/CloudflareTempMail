import PostalMime from "postal-mime";

export default {
    async email(message, env, ctx) {
        if (env.FORWARD_EMAIL != "") {
            await message.forward(env.FORWARD_EMAIL);
        }

        const parser = new PostalMime();
        const email = await parser.parse(message.raw);

        //Get current inbox for the email
        const inboxJSON = (await env.INBOXES.get(message.to)) || "[]";
        const inbox = JSON.parse(inboxJSON);

        //Add email to inbox
        await inbox.push(email);

        //Save inbox
        await env.INBOXES.put(message.to, JSON.stringify(inbox), { expirationTtl: env.EMAIL_TIMEOUT });
    },

    async fetch(request, env, ctx) {
        //Get route from request
        const route = request.url.split("/").pop().split("?")[0];

        let html = "";

        switch (route) {
            case "":
                html = `
                <!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Temp Mail</title>
    </head>
    <body>
        <div class="generator-container">
            <h1>Temp Mail</h1>
            <div class="generator">
                <form>
                    <button type="submit" id="random-email">Random</button>
                    <input type="text" name="email" id="email" placeholder="Email" />
                    <button type="submit" id="open-email">Open Inbox</button>
                </form>
            </div>
        </div>
        <div class="inbox-container">
            <h1>Inbox</h1>
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Refresh_icon.svg" />
            <div class="inbox">
                <div class="email">No emails</div>
            </div>
        </div>
        <script>
            let lastEmails = [];
            function loadEmails(addr) {
                fetch("/inbox?name=" + addr)
                    .then((res) => res.json())
                    .then((data) => {
                        if (JSON.stringify(data) === JSON.stringify(lastEmails)) {
                            return;
                        }

                        lastEmails = data;

                        if (data.length === 0) {
                            document.querySelector(".inbox").innerHTML = '<div class="email">No emails</div>';
                            return;
                        }

                        document.querySelector(".inbox").innerHTML = data
                            .map(
                                (email) =>
                                    "<div class='email'><div style='pointer-events: none'>" +
                                    email.date +
                                    "</div><div style='pointer-events: none'>" +
                                    email.subject +
                                    '</div><div class="content" style="display: none">' +
                                    email.html +
                                    "</div></div>"
                            )
                            .join("");
                    })
                    .then(() => {
                        document.querySelectorAll(".email").forEach((email) => {
                            email.addEventListener("click", () => {
                                email.querySelector(".content").style.display = email.querySelector(".content").style.display === "none" ? "block" : "none";
                            });
                        });
                    });

                document.querySelector("img").style.display = "block";
            }

            function emailFromInput() {
                return document.getElementById("email").value.split("@")[0] + "@snailbox.live";
            }

            document.getElementById("random-email").addEventListener("click", (e) => {
                e.preventDefault();
                document.getElementById("email").value = genEmail() + "@snailbox.live";
                loadEmails(emailFromInput());
            });

            document.getElementById("open-email").addEventListener("click", (e) => {
                e.preventDefault();
                loadEmails(emailFromInput());
            });

            setInterval(() => {
                if (document.getElementById("email").value) {
                    loadEmails(emailFromInput());
                }
            }, 5000);

            // prettier-ignore
            const adjectives = ["happy", "sad", "angry", "joyful", "excited", "bored", "calm", "eager", "afraid", "confident", "proud", "curious", "surprised", "tired", "annoyed", "embarrassed", "jealous", "grateful", "lonely", "shocked", "scared", "amused", "brave", "relaxed", "kind", "cheerful", "friendly", "upset", "interested", "satisfied", "disappointed", "nervous", "scared", "worried", "surprised", "confused", "doubtful", "amazed", "overwhelmed", "determined", "realistic", "optimistic", "pessimistic", "content", "indecisive", "inspired", "hopeful", "impressed", "intimidated", "irritated", "judgmental", "lucky", "manipulative", "miserable", "motivated", "obnoxious", "overjoyed", "peaceful", "powerful", "regretful", "rejected", "revengeful", "silly", "thankful", "thoughtful", "tolerant", "trustworthy", "uncomfortable", "underestimated", "unique", "victorious", "vindictive", "wise", "witty", "zealous", "zestful"];
            // prettier-ignore
            const nouns = ["dog", "cat", "car", "city", "book", "phone", "computer", "garden", "tree", "shirt", "shoe", "river", "mountain", "cloud", "rain", "sun", "moon", "star", "ocean", "beach", "forest", "desert", "jungle", "island", "street", "road", "house", "building", "chair", "table", "pen", "pencil", "keyboard", "mouse", "painting", "picture", "music", "game", "movie", "flower", "grass", "bird", "fish", "animal", "human", "robot", "love", "peace", "war", "party", "event", "holiday", "birthday", "meeting", "food", "drink", "fruit", "vegetable", "meat", "bread", "cheese", "rice", "pizza", "burger", "salad", "chocolate", "candy", "cake", "ice cream", "tea", "coffee", "water", "wine", "beer", "cocktail", "juice", "milk", "soda", "soup", "yogurt", "egg", "butter", "jam", "salt", "pepper", "sugar", "spice", "herb", "oil", "sauce", "vinegar"];

            function genEmail() {
                const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                const noun = nouns[Math.floor(Math.random() * nouns.length)];
                return adjective + "-" + noun;
            }
        </script>
        <style>
            html,
            body {
                margin: 0;
                padding: 0;

                background-color: #111;
                color: #fff;

                font-family: "Courier New", Courier, monospace;
            }

            body {
                display: grid;
                justify-items: center;
                align-items: start;

                text-align: center;

                grid-template-rows: auto 1fr;

                height: 100vh;
            }

            .generator {
                background-color: #1a1a1a;

                border: 2px dashed #444;
                border-radius: 2px;

                width: 600px;

                > form {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;

                    width: 100%;

                    > input {
                        text-align: center;

                        text-decoration: none;
                        color: white;

                        width: 200px;

                        padding: 10px;
                        background-color: #111;

                        border: 2px dashed #444;
                        border-radius: 2px;
                    }

                    > input:focus {
                        outline: none;
                        border-color: #888;
                    }

                    > button {
                        padding: 10px 20px;
                        background-color: #1a1a1a;
                        color: white;

                        border: 2px dashed #444;
                        border-radius: 2px;

                        width: 100%;

                        margin: 20px;
                    }

                    > button:hover {
                        border-color: #888;
                        cursor: pointer;
                    }
                }
            }

            .inbox-container {
                margin-top: 20px;
                padding: 20px;
                background-color: #1a1a1a;

                position: relative;

                box-sizing: border-box;

                border: 2px dashed #444;
                border-radius: 2px;

                width: 90%;

                > img {
                    position: absolute;

                    top: 0px;
                    right: 0px;

                    width: 20px;
                    height: 20px;

                    margin: 20px;

                    cursor: pointer;

                    display: none;

                    animation: spinanim 2s infinite linear;
                }

                .inbox {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;

                    .email {
                        padding: 20px;

                        border: 2px dashed #444;
                        border-radius: 2px;
                    }

                    .email:hover {
                        border-color: #888;
                        cursor: pointer;
                    }
                }
            }

            @keyframes spinanim {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(-360deg);
                }
            }
        </style>
    </body>
</html>

                `;
                return new Response(html, { headers: { "content-type": "text/html" } });
            case "inbox":
                //Get requested inbox name
                const inboxName = new URL(request.url).searchParams.get("name");

                //Get inbox from namespace
                const inboxJSONString = (await env.INBOXES.get(inboxName)) || "[]";
                const inboxJSON = JSON.parse(inboxJSONString);

                //Reverse inbox to show most recent emails first
                inboxJSON.reverse();

                return new Response(JSON.stringify(inboxJSON), { headers: { "content-type": "application/json" } });
            default:
                return new Response("Route not found", { status: 404 });
        }
    },
};
