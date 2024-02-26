// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// These types are generated automatically if you're using an ORM such as Prisma.

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

type Tutor = {
  activeStatusId: number,
  bioText: string,
  email: string,
  firstName: string,
  lastName: string,
  majorId: number,
  payRate: number,
  phoneNumber: number,
  pictureUrl: string,
  seniorityId: number,
  tutorId: number,
  uin: number,
  coursePreferences: {id: number, courseDept: string, courseGrade: string, courseName: string, courseNumber: number}[],
  averageRating: number
  numberOfRatings: number,
  locations: string,
  listingTitle: string,
};