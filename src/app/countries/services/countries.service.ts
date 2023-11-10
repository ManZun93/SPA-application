import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country } from '../interfaces/country.interface';
import { Observable, catchError, tap, map, of } from 'rxjs';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Region } from '../interfaces/region.type';

@Injectable({ providedIn: 'root' })
export class CountriesService {


  private apiUrl: string = 'https://restcountries.com/v3.1';

  public cacheStorage: CacheStore = {
    byCapital:   {term: '', countries: [] },
    byCountries: {term: '', countries: [] },
    byRegion:    {region: '', countries: [] }
  }

  constructor(private http: HttpClient) {
    this.loadFromLocalStorage();
  } //para usar Http client hay que importar el Http client module en app.module

  private saveToLocalStorage(){
    localStorage.setItem('cachestorage', JSON.stringify(this.cacheStorage) );
  }

  public loadFromLocalStorage(){
    if(!localStorage.getItem('cachestorage')) return;
    this.cacheStorage = JSON.parse(localStorage.getItem('cachestorage')!)
  }

  private getCountriesRequest(url: string): Observable<Country[]> {
    return this.http.get<Country[]>(url)
    .pipe(
      catchError(() => of([])),
      // delay(2000)
      );
  }


  searchCountryByAlphaCode(code: string): Observable<Country | null> {
    const url = `${this.apiUrl}/alpha/${code}`;
    return this.http.get<Country[]>(url).pipe(
      map(countries => countries.length > 0  ? countries[0] : null),
      catchError(() => of(null)));
  }

  searchCapital(term: string): Observable<Country[]> {
    const url = `${this.apiUrl}/capital/${term}`;
    return this.getCountriesRequest(url)
    .pipe(
      tap(countries => this.cacheStorage.byCapital = {term, countries}),
      tap(() => this.saveToLocalStorage())
    )
  }

  searchCountry(term: string): Observable<Country[]> {
    const url = `${this.apiUrl}/name/${term}`;
    return this.getCountriesRequest(url)
    .pipe(
      tap(countries => this.cacheStorage.byCountries = {term, countries}),
      tap(() => this.saveToLocalStorage())
    )
  }

  searchRegion(region: Region): Observable<Country[]> {

    const url = `${this.apiUrl}/region/${region}`;
    return this.getCountriesRequest(url)
    .pipe(
      tap(countries => this.cacheStorage.byRegion = {region, countries}),
      tap(() => this.saveToLocalStorage())
    )
  }
}
