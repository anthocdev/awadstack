import { Movie } from "../entities/Movie";
import {
  Arg,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAdmin } from "../middleware/isAdmin";
import { getConnection } from "typeorm";

@ObjectType()
class PaginatedMovies {
  @Field(() => [Movie])
  movies: Movie[];
  @Field()
  hasMore: boolean;
}

@Resolver()
export class MovieResolver {
  /* Get all movies */
  @Query(() => PaginatedMovies)
  async movies(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedMovies> {
    const realLimit = Math.min(50, limit);
    const extraLimit = realLimit + 1;
    const qb = getConnection()
      .getRepository(Movie)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC")
      .take(extraLimit);

    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }

    const movies = await qb.getMany();

    return {
      movies: movies.slice(0, realLimit),
      hasMore: movies.length === extraLimit,
    };
  }
  /*Find movie by id */
  @Query(() => Movie, { nullable: true })
  movie(@Arg("id") id: number): Promise<Movie | undefined> {
    return Movie.findOne(id);
  }
  /* Create Movie Listing */
  @Mutation(() => Movie)
  @UseMiddleware(isAdmin)
  async createMovie(
    @Arg("title") title: string,
    @Arg("imageLink") imageLink: string,
    @Arg("imdbId") imdbId: string
  ): Promise<Movie> {
    //2 SQL queries
    return Movie.create({ title, imageLink, imdbId }).save();
  }

  /* Update Movie Listing */
  @Mutation(() => Movie, { nullable: true })
  @UseMiddleware(isAdmin)
  async updateMovie(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("imageLink", () => String, { nullable: true }) imageLink: string,
    @Arg("imdbId", () => String, { nullable: true }) imdbId: string
  ): Promise<Movie | null> {
    const movie = await Movie.findOne(id);
    if (!movie) {
      return null;
    }

    if (typeof imdbId !== "undefined") {
      movie.imdbId = imdbId;
    }

    if (typeof imageLink !== "undefined") {
      //Image link optional for now
      movie.imageLink = imageLink;
    }

    if (typeof title !== "undefined") {
      Movie.update({ id }, { title, imageLink, imdbId });
    }

    return movie;
  }

  /* Delete Movie */
  @Mutation(() => Boolean)
  @UseMiddleware(isAdmin)
  async deleteMovie(@Arg("id") id: number): Promise<boolean> {
    try {
      await Movie.delete(id);
    } catch {
      return false;
    }

    return true;
  }
}
