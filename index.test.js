const request = require("supertest");
const app = require("./index");

describe("Test /upload endpoint", () => {
  it("should upload an image successfully", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("testImage", "path/to/test-image.png")
      .field("email", "test@example.com");

    expect(response.status).toBe(200);
    expect(response.text).toBe("successfully uploaded");
  });

  it("should return an error if image upload fails", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("testImage", "path/to/non-existing-image.png")
      .field("email", "test@example.com");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Internal Server Error");
  });
});

describe("Test /getImage endpoint", () => {
  it("should get image details successfully", async () => {
    const response = await request(app).get("/getImage");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: expect.any(String),
          image: expect.any(String),
        }),
      ])
    );
  });

  it("should return an error if getting image details fails", async () => {
    const response = await request(app).get("/getImage");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Internal Server Error");
  });
});
