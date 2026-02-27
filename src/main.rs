mod nfa;
mod dfa;
mod converter;
mod minimizer;
mod api;

use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use api::{convert_nfa_to_dfa, convert_nfa_to_minimized_dfa};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .route("/health", web::get().to(|| async { "Server is running" }))
            .route("/convert", web::post().to(convert_nfa_to_dfa))
            .route("/minimize", web::post().to(convert_nfa_to_minimized_dfa))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
