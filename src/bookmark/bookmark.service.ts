import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from './dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async createBookmark(
    userId: number,
    dto: CreateBookmarkDto,
  ) {
    const bookmark =
      await this.prisma.bookmark.create({
        data: {
          userId,
          ...dto,
        },
      });

    return bookmark;
  }

  async getBookmarkById(
    userId: number,
    bookmarkId: number,
  ) {
    const bookmark =
      await this.prisma.bookmark.findFirst({
        where: {
          id: bookmarkId,
          userId: userId,
        },
      });

    if (!bookmark) {
      return new NotFoundError(
        'Id is not found in the database',
      );
    }

    return bookmark;
  }

  async updateBookmark(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark =
      await this.prisma.bookmark.findFirst({
        where: {
          userId: userId,
          id: bookmarkId,
        },
      });

    if (!bookmark) {
      return new NotFoundError(
        'Entity not found',
      );
    }

    if (bookmark.userId !== userId) {
      return new ForbiddenException(
        'Access denied',
      );
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmark(
    userId: number,
    bookmarkId: number,
  ) {
    const bookmark =
      await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

    if (!bookmark) {
      return new NotFoundError(
        'Entity not found',
      );
    }

    if (bookmark.userId !== userId) {
      return new ForbiddenException(
        'Access denied',
      );
    }

    const deletedBookmark =
      await this.prisma.bookmark.delete({
        where: { id: bookmarkId },
      });

    if (deletedBookmark) {
      return { msg: 'Bookmark deleted' };
    }
    return { msg: 'bookmark not deleted' };
  }
}
