import { ServiceType } from '../typing/roles';

/**
 * Company represents a service provider organization
 * (e.g., hotel chain, taxi company, restaurant group)
 */
export class Company {
  id!: string;
  private name!: string;
  private serviceType!: ServiceType;
  private description?: string;
  private logo?: string;
  private website?: string;
  private email!: string;
  private phone?: string;
  private address?: string;
  private city?: string;
  private country?: string;
  private isVerified: boolean = false;
  private isActive: boolean = true;
  private createdAt: Date = new Date();
  private updatedAt: Date = new Date();

  // Getters
  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getServiceType(): ServiceType { return this.serviceType; }
  getDescription(): string | undefined { return this.description; }
  getLogo(): string | undefined { return this.logo; }
  getWebsite(): string | undefined { return this.website; }
  getEmail(): string { return this.email; }
  getPhone(): string | undefined { return this.phone; }
  getAddress(): string | undefined { return this.address; }
  getCity(): string | undefined { return this.city; }
  getCountry(): string | undefined { return this.country; }
  isVerifiedCompany(): boolean { return this.isVerified; }
  isActiveCompany(): boolean { return this.isActive; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Setters
  setName(name: string): this {
    this.name = name;
    return this.touch();
  }

  setDescription(description: string): this {
    this.description = description;
    return this.touch();
  }

  setLogo(logo: string): this {
    this.logo = logo;
    return this.touch();
  }

  setWebsite(website: string): this {
    this.website = website;
    return this.touch();
  }

  setPhone(phone: string): this {
    this.phone = phone;
    return this.touch();
  }

  setAddress(address: string, city: string, country: string): this {
    this.address = address;
    this.city = city;
    this.country = country;
    return this.touch();
  }

  setVerified(verified: boolean): this {
    this.isVerified = verified;
    return this.touch();
  }

  setActive(active: boolean): this {
    this.isActive = active;
    return this.touch();
  }

  private touch(): this {
    this.updatedAt = new Date();
    return this;
  }

  static create(params: {
    id: string;
    name: string;
    serviceType: ServiceType;
    email: string;
    description?: string;
    logo?: string;
    website?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }): Company {
    const company = new Company();
    company.id = params.id;
    company.name = params.name;
    company.serviceType = params.serviceType;
    company.email = params.email;
    company.description = params.description;
    company.logo = params.logo;
    company.website = params.website;
    company.phone = params.phone;
    company.address = params.address;
    company.city = params.city;
    company.country = params.country;
    company.createdAt = new Date();
    company.updatedAt = new Date();
    return company;
  }
}
