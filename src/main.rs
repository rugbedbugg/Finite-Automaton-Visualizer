mod nfa;
mod dfa;
mod converter;
mod api;

use actix_web::{web, App, HttpServer};
use api::convert::convert_nfa_to_dfa;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(|| async { "Server is running" }))
            .route("/convert", web::post().to(convert_nfa_to_dfa))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
