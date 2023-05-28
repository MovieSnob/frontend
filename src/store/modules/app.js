import { searchMovie } from "../../api/moviesDB";
import {
  suggestMovie,
  fetchSuggestedMovies,
  fetchReviewedMovies,
  markWatched,
  markUnwatched,
  scoreMovie,
  removeMovie,
} from "../../api/movies";
import { fetchUsers } from "../../api/users";
import { fetchStats } from "../../api/stats";

const app = {
  state: {
    moviesSearch: {
      results: [],
    },
    suggested: [],
    suggestedMoviesLoaded: false,
    reviewed: [],
    reviewedMoviesLoaded: false,
    users: [],
    usersLoaded: false,
    movieUnderReview: {},
    watchedMovies: {},
    stats: {},
    statsLoaded: false,
  },
  mutations: {
    SET_SEARCH_RESULTS: (state, movies) => {
      state.moviesSearch = movies;
    },
    SET_SUGGESTED: (state, movies) => {
      state.suggested = movies;
      state.suggestedMoviesLoaded = true;
    },
    SET_REVIEWED: (state, movies) => {
      state.reviewed = movies;
      state.reviewedMoviesLoaded = true;
    },
    SET_WATCHED: (state, { movieId, userId, date }) => {
      state.suggested = state.suggested.map((movie) => {
        if (movie.id === movieId) {
          movie.watched_on = date;
        }

        return movie;
      });

      state.users = state.users.map((user) => {
        if (user.id === userId) {
          user.watchedMovies = [...user.watchedMovies, movieId];
        }

        return user;
      });
    },
    SET_UNWATCHED: (state, { movieId, userId }) => {
      state.suggested = state.suggested.map((movie) => {
        if (movie.id === movieId) {
          movie.watched_on = null;
        }

        return movie;
      });

      state.users = state.users.map((user) => {
        if (user.id === userId) {
          user.watchedMovies = user.watchedMovies.filter(
            (id) => movieId !== id
          );
        }

        return user;
      });
    },
    SET_USERS: (state, users) => {
      state.users = users;
      state.usersLoaded = true;
    },
    SET_MOVIE_UNDER_REVIEW: (state, movieId) => {
      state.suggested = state.suggested.map((movie) => {
        movie.under_review = movie.id === movieId;

        return movie;
      });
    },
    SET_MOVIE_SCORE: (state, score) => {
      state.movieUnderReview.score = score;
    },
    SET_MOVIE_SCORES: (state, { id, scores }) => {
      state.suggested = state.suggested.map((movie) => {
        if (movie.id === id) {
          movie.scores = scores;
        }

        return movie;
      });
    },
    REMOVE_SUGGESTED_MOVIE: (state, id) => {
      state.suggested = state.suggested.filter((movie) => movie.id !== id);
    },
    SET_WATCHED_MOVIES: (state) => {
      let watchedMovies = {};

      state.suggested.map((movie) => {
        watchedMovies[movie.id] = state.users
          .filter((user) => {
            return user.watchedMovies.includes(movie.id);
          })
          .map((movie) => movie.id);
      });

      state.watchedMovies = watchedMovies;
    },
    SET_STATS: (state, stats) => {
      state.stats = stats;
      state.statsLoaded = true;
    },
  },
  actions: {
    async SearchMovies({ commit }, { query }) {
      const moviesResponse = await searchMovie(query);

      commit("SET_SEARCH_RESULTS", moviesResponse.data);
    },
    EmptySearchMoviesList({ commit }) {
      commit("SET_SEARCH_RESULTS", { results: [] });
    },
    async SuggestMovie({ commit }, { title, year, poster, movieDBId }) {
      const response = await suggestMovie(title, year, poster, movieDBId);

      commit("SET_SUGGESTED", response.data);
    },
    async RemoveMovieSuggestion({ commit }, id) {
      removeMovie(id);

      commit("REMOVE_SUGGESTED_MOVIE", id);
    },
    async FetchSuggestedMovies({ commit }) {
      const response = await fetchSuggestedMovies();

      commit("SET_SUGGESTED", response.data);
    },
    async FetchReviewedMovies({ commit }) {
      const response = await fetchReviewedMovies();

      commit("SET_REVIEWED", response.data);
    },
    MarkWatched({ commit }, { id, userId, date }) {
      markWatched(id, userId, date);

      commit("SET_WATCHED", { movieId: id, userId, date });
    },
    MarkUnwatched({ commit }, { id, userId }) {
      markUnwatched(id, userId);

      commit("SET_UNWATCHED", { movieId: id, userId });
    },
    async FetchUsers({ commit }) {
      const response = await fetchUsers();

      commit("SET_USERS", response.data);
    },
    async SetUsers({ commit }, users) {
      commit("SET_USERS", users);
    },
    async FetchStats({ commit }) {
      const response = await fetchStats();

      commit("SET_STATS", response.data);
    },
    SetMovieUnderReview({ commit }, movieId) {
      commit("SET_MOVIE_UNDER_REVIEW", movieId);
    },
    ScoreMovie({ commit }, { id, score }) {
      scoreMovie(id, score);

      commit("SET_MOVIE_SCORE", score);
    },
    SetScores({ commit }, { id, scores }) {
      commit("SET_MOVIE_SCORES", { id, scores });
    },
    PopulateWatchedMovies({ commit }) {
      commit("SET_WATCHED_MOVIES");
    },
  },
};

export default app;
