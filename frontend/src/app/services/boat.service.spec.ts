import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BoatService } from './boat.service';
import { Boat } from '../models/boat';
import { API_CONFIG } from '../config/api.config';

describe('BoatService', () => {
  let service: BoatService;
  let httpMock: HttpTestingController;

  const mockToken = 'mock-jwt-token';
  const baseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.BOATS}`;
  const mockBoat: Boat = { id: 1, name: 'Test Boat', description: 'Test Desc' };
  const mockBoats: Boat[] = [
    { id: 1, name: 'Boat 1', description: 'Desc 1' },
    { id: 2, name: 'Boat 2', description: 'Desc 2' },
  ];

  beforeEach(() => {
    // Mock localStorage.getItem
    spyOn(localStorage, 'getItem').and.returnValue(mockToken);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BoatService],
    });

    service = TestBed.inject(BoatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all boats with authorization header', () => {
    service.getBoats().subscribe((boats) => {
      expect(boats).toEqual(mockBoats);
      expect(boats.length).toBe(2);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${mockToken}`
    );
    req.flush(mockBoats);
  });

  it('should handle error when getting all boats', () => {
    service.getBoats().subscribe({
      next: () => fail('Should have failed with 500 error'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Server Error');
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Server error', { status: 500, statusText: 'Server Error' });
  });

  it('should get a boat by id with authorization header', () => {
    const id = 1;
    service.getBoat(id).subscribe((boat) => {
      expect(boat).toEqual(mockBoat);
      expect(boat.id).toBe(id);
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${mockToken}`
    );
    req.flush(mockBoat);
  });

  it('should handle error when getting a boat by id', () => {
    const id = 1;
    service.getBoat(id).subscribe({
      next: () => fail('Should have failed with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      },
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should add a boat with authorization header', () => {
    const newBoat = { name: 'New Boat', description: 'New Desc' } as Boat;
    const returnedBoat = { id: 3, ...newBoat };

    service.addBoat(newBoat).subscribe((boat) => {
      expect(boat).toEqual(returnedBoat);
      expect(boat.id).toBe(3);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${mockToken}`
    );
    expect(req.request.body).toEqual(newBoat);
    req.flush(returnedBoat);
  });

  it('should handle error when adding a boat', () => {
    const newBoat = { name: 'New Boat', description: 'New Desc' } as Boat;

    service.addBoat(newBoat).subscribe({
      next: () => fail('Should have failed with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
  });

  it('should update a boat with authorization header', () => {
    const id = 1;
    const updatedBoat = {
      id,
      name: 'Updated Boat',
      description: 'Updated Desc',
    };

    service.updateBoat(id, updatedBoat).subscribe((boat) => {
      expect(boat).toEqual(updatedBoat);
      expect(boat.id).toBe(id);
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${mockToken}`
    );
    expect(req.request.body).toEqual(updatedBoat);
    req.flush(updatedBoat);
  });

  it('should handle error when updating a boat', () => {
    const id = 1;
    const updatedBoat = {
      id,
      name: 'Updated Boat',
      description: 'Updated Desc',
    };

    service.updateBoat(id, updatedBoat).subscribe({
      next: () => fail('Should have failed with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      },
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
  });

  it('should delete a boat with authorization header', () => {
    const id = 1;

    service.deleteBoat(id).subscribe(() => {
      expect(true).toBe(true); // Simply verify subscription completes
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${mockToken}`
    );
    req.flush(null); // DELETE typically returns no content
  });

  it('should handle error when deleting a boat', () => {
    const id = 1;

    service.deleteBoat(id).subscribe({
      next: () => fail('Should have failed with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      },
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should include token from localStorage in headers', () => {
    service.getBoats().subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${mockToken}`
    );
    req.flush([]);
  });

  it('should handle missing token in localStorage', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);

    service.getBoats().subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.headers.get('Authorization')).toBe('Bearer null');
    req.flush([]);
  });
});
