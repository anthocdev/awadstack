import { Movie } from "../entities/Movie";
import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class MovieResolver {
  /* Get all movies */
  @Query(() => [Movie])
  movies(@Ctx() { em }: MyContext): Promise<Movie[]> {
    return em.find(Movie, {});
  }
  /*Find movie by id */
  @Query(() => Movie, { nullable: true })
  movie(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<Movie | null> {
    return em.findOne(Movie, { id });
  }
  /* Create Movie Listing */
  @Mutation(() => Movie)
  async createMovie(
    @Arg("title") title: string,
    @Arg("imageLink") imageLink: string,
    @Ctx() { em }: MyContext
  ): Promise<Movie> {
    const movie = em.create(Movie, { title, imageLink });
    await em.persistAndFlush(movie);
    return movie;
  }

  /* Update Movie Listing */
  @Mutation(() => Movie, { nullable: true })
  async updateMovie(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("imageLink", () => String, { nullable: true }) imageLink: string,
    @Ctx() { em }: MyContext
  ): Promise<Movie | null> {
    const movie = await em.findOne(Movie, { id });
    if (!movie) {
      return null;
    }

    if (typeof imageLink !== "undefined") {
      //Image link optional for now
      movie.imageLink = imageLink;
    }

    if (typeof title !== "undefined") {
      movie.title = title;
      await em.persistAndFlush(movie);
    }

    return movie;
  }

  /* Delete Movie */
  @Mutation(() => Boolean)
  async deleteMovie(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Movie, { id });
    } catch {
      return false;
    }

    return true;
  }
}
