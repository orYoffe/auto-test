import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { NoteService } from '../services/note.service';

// Note interface
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Request body interfaces
interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
}

interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

// Initialize service
const noteService = new NoteService();

// Routes plugin
export const noteRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET all notes
  fastify.get('/', async (request, reply) => {
    try {
      const notes = await noteService.findAll();
      return reply.code(200).send(notes);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Error retrieving notes',
      });
    }
  });

  // GET note by ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const note = await noteService.findById(id);

        if (!note) {
          return reply.code(404).send({
            error: 'Not Found',
            message: `Note with ID ${id} not found`,
          });
        }

        return reply.code(200).send(note);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Error retrieving note',
        });
      }
    }
  );

  // POST new note
  fastify.post<{ Body: CreateNoteRequest }>(
    '/',
    async (request, reply) => {
      try {
        const { title, content, tags } = request.body;

        // Validate request body
        if (!title || !content) {
          return reply.code(400).send({
            error: 'Bad Request',
            message: 'Title and content are required',
          });
        }

        const newNote = await noteService.create({
          title,
          content,
          tags: tags || [],
        });

        return reply.code(201).send(newNote);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Error creating note',
        });
      }
    }
  );

  // PUT update note
  fastify.put<{ Params: { id: string }; Body: UpdateNoteRequest }>(
    '/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { title, content, tags } = request.body;

        const updatedNote = await noteService.update(id, {
          title,
          content,
          tags,
        });

        if (!updatedNote) {
          return reply.code(404).send({
            error: 'Not Found',
            message: `Note with ID ${id} not found`,
          });
        }

        return reply.code(200).send(updatedNote);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Error updating note',
        });
      }
    }
  );

  // DELETE note
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const deleted = await noteService.delete(id);

        if (!deleted) {
          return reply.code(404).send({
            error: 'Not Found',
            message: `Note with ID ${id} not found`,
          });
        }

        return reply.code(200).send({
          message: `Note with ID ${id} deleted successfully`,
        });
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Error deleting note',
        });
      }
    }
  );

  // GET notes by tag
  fastify.get<{ Params: { tag: string } }>(
    '/tag/:tag',
    async (request, reply) => {
      try {
        const { tag } = request.params;
        const notes = await noteService.findByTag(tag);

        return reply.code(200).send(notes);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Error retrieving notes by tag',
        });
      }
    }
  );
};
