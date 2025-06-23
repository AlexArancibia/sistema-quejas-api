import { PrismaClient } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';

const prisma = new PrismaClient()

  async function seedGeographicData() {
    console.log('🌍 Iniciando seed de datos geográficos...');

    try {
      // Limpiar datos existentes
      await cleanExistingData();

      // Crear países
      await seedCountries();

      // Crear estados/departamentos
      await seedStates();

      // Crear ciudades (todas para Perú y EE.UU.)
      await seedCities();

      // Crear patrones geográficos

      console.log('✅ Seed geográfico completado exitosamente');
    } catch (error) {
      console.error('❌ Error en seed geográfico:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

    async function cleanExistingData() {
    console.log('🧹 Limpiando datos existentes...');
    
    await prisma.$transaction([
      prisma.city.deleteMany(),
      prisma.state.deleteMany(),
      prisma.country.deleteMany(),
    ]);
  }

    async function seedCountries() {
    console.log('🏳️ Creando países...');

    const countries = [
      // América del Sur
      { code: 'PE', code3: 'PER', name: 'Peru', nameLocal: 'Perú', phoneCode: '+51', currency: 'PEN' },
      { code: 'AR', code3: 'ARG', name: 'Argentina', nameLocal: 'Argentina', phoneCode: '+54', currency: 'ARS' },
      { code: 'BR', code3: 'BRA', name: 'Brazil', nameLocal: 'Brasil', phoneCode: '+55', currency: 'BRL' },
      { code: 'CL', code3: 'CHL', name: 'Chile', nameLocal: 'Chile', phoneCode: '+56', currency: 'CLP' },
      { code: 'CO', code3: 'COL', name: 'Colombia', nameLocal: 'Colombia', phoneCode: '+57', currency: 'COP' },
      { code: 'EC', code3: 'ECU', name: 'Ecuador', nameLocal: 'Ecuador', phoneCode: '+593', currency: 'USD' },
      { code: 'UY', code3: 'URY', name: 'Uruguay', nameLocal: 'Uruguay', phoneCode: '+598', currency: 'UYU' },
      { code: 'PY', code3: 'PRY', name: 'Paraguay', nameLocal: 'Paraguay', phoneCode: '+595', currency: 'PYG' },
      { code: 'BO', code3: 'BOL', name: 'Bolivia', nameLocal: 'Bolivia', phoneCode: '+591', currency: 'BOB' },
      { code: 'VE', code3: 'VEN', name: 'Venezuela', nameLocal: 'Venezuela', phoneCode: '+58', currency: 'VES' },
      { code: 'GY', code3: 'GUY', name: 'Guyana', nameLocal: 'Guyana', phoneCode: '+592', currency: 'GYD' },
      { code: 'SR', code3: 'SUR', name: 'Suriname', nameLocal: 'Suriname', phoneCode: '+597', currency: 'SRD' },
      { code: 'GF', code3: 'GUF', name: 'French Guiana', nameLocal: 'Guyane française', phoneCode: '+594', currency: 'EUR' },

      // América del Norte
      { code: 'US', code3: 'USA', name: 'United States', nameLocal: 'United States', phoneCode: '+1', currency: 'USD' },
      { code: 'CA', code3: 'CAN', name: 'Canada', nameLocal: 'Canada', phoneCode: '+1', currency: 'CAD' },
      { code: 'MX', code3: 'MEX', name: 'Mexico', nameLocal: 'México', phoneCode: '+52', currency: 'MXN' },
    ];

    for (const country of countries) {
      await prisma.country.create({
        data: {
          ...country,
          isActive: true
        }
      });
      console.log(`  ✓ País creado: ${country.name}`);
    }
  }

    async function seedStates() {
    console.log('🗺️ Creando estados/departamentos...');

    const states = [
      // PERÚ - Departamentos (25)
      { countryCode: 'PE', code: 'AMA', name: 'Amazonas', type: 'department' },
      { countryCode: 'PE', code: 'ANC', name: 'Áncash', type: 'department' },
      { countryCode: 'PE', code: 'APU', name: 'Apurímac', type: 'department' },
      { countryCode: 'PE', code: 'ARE', name: 'Arequipa', type: 'department' },
      { countryCode: 'PE', code: 'AYA', name: 'Ayacucho', type: 'department' },
      { countryCode: 'PE', code: 'CAJ', name: 'Cajamarca', type: 'department' },
      { countryCode: 'PE', code: 'CAL', name: 'Callao', type: 'constitutional_province' },
      { countryCode: 'PE', code: 'CUS', name: 'Cusco', type: 'department' },
      { countryCode: 'PE', code: 'HUV', name: 'Huancavelica', type: 'department' },
      { countryCode: 'PE', code: 'HUC', name: 'Huánuco', type: 'department' },
      { countryCode: 'PE', code: 'ICA', name: 'Ica', type: 'department' },
      { countryCode: 'PE', code: 'JUN', name: 'Junín', type: 'department' },
      { countryCode: 'PE', code: 'LAL', name: 'La Libertad', type: 'department' },
      { countryCode: 'PE', code: 'LAM', name: 'Lambayeque', type: 'department' },
      { countryCode: 'PE', code: 'LIM', name: 'Lima', type: 'department' },
      { countryCode: 'PE', code: 'LOR', name: 'Loreto', type: 'department' },
      { countryCode: 'PE', code: 'MDD', name: 'Madre de Dios', type: 'department' },
      { countryCode: 'PE', code: 'MOQ', name: 'Moquegua', type: 'department' },
      { countryCode: 'PE', code: 'PAS', name: 'Pasco', type: 'department' },
      { countryCode: 'PE', code: 'PIU', name: 'Piura', type: 'department' },
      { countryCode: 'PE', code: 'PUN', name: 'Puno', type: 'department' },
      { countryCode: 'PE', code: 'SAM', name: 'San Martín', type: 'department' },
      { countryCode: 'PE', code: 'TAC', name: 'Tacna', type: 'department' },
      { countryCode: 'PE', code: 'TUM', name: 'Tumbes', type: 'department' },
      { countryCode: 'PE', code: 'UCA', name: 'Ucayali', type: 'department' },

      // ESTADOS UNIDOS - Estados (50 + DC)
      { countryCode: 'US', code: 'AL', name: 'Alabama', type: 'state' },
      { countryCode: 'US', code: 'AK', name: 'Alaska', type: 'state' },
      { countryCode: 'US', code: 'AZ', name: 'Arizona', type: 'state' },
      { countryCode: 'US', code: 'AR', name: 'Arkansas', type: 'state' },
      { countryCode: 'US', code: 'CA', name: 'California', type: 'state' },
      { countryCode: 'US', code: 'CO', name: 'Colorado', type: 'state' },
      { countryCode: 'US', code: 'CT', name: 'Connecticut', type: 'state' },
      { countryCode: 'US', code: 'DE', name: 'Delaware', type: 'state' },
      { countryCode: 'US', code: 'FL', name: 'Florida', type: 'state' },
      { countryCode: 'US', code: 'GA', name: 'Georgia', type: 'state' },
      { countryCode: 'US', code: 'HI', name: 'Hawaii', type: 'state' },
      { countryCode: 'US', code: 'ID', name: 'Idaho', type: 'state' },
      { countryCode: 'US', code: 'IL', name: 'Illinois', type: 'state' },
      { countryCode: 'US', code: 'IN', name: 'Indiana', type: 'state' },
      { countryCode: 'US', code: 'IA', name: 'Iowa', type: 'state' },
      { countryCode: 'US', code: 'KS', name: 'Kansas', type: 'state' },
      { countryCode: 'US', code: 'KY', name: 'Kentucky', type: 'state' },
      { countryCode: 'US', code: 'LA', name: 'Louisiana', type: 'state' },
      { countryCode: 'US', code: 'ME', name: 'Maine', type: 'state' },
      { countryCode: 'US', code: 'MD', name: 'Maryland', type: 'state' },
      { countryCode: 'US', code: 'MA', name: 'Massachusetts', type: 'state' },
      { countryCode: 'US', code: 'MI', name: 'Michigan', type: 'state' },
      { countryCode: 'US', code: 'MN', name: 'Minnesota', type: 'state' },
      { countryCode: 'US', code: 'MS', name: 'Mississippi', type: 'state' },
      { countryCode: 'US', code: 'MO', name: 'Missouri', type: 'state' },
      { countryCode: 'US', code: 'MT', name: 'Montana', type: 'state' },
      { countryCode: 'US', code: 'NE', name: 'Nebraska', type: 'state' },
      { countryCode: 'US', code: 'NV', name: 'Nevada', type: 'state' },
      { countryCode: 'US', code: 'NH', name: 'New Hampshire', type: 'state' },
      { countryCode: 'US', code: 'NJ', name: 'New Jersey', type: 'state' },
      { countryCode: 'US', code: 'NM', name: 'New Mexico', type: 'state' },
      { countryCode: 'US', code: 'NY', name: 'New York', type: 'state' },
      { countryCode: 'US', code: 'NC', name: 'North Carolina', type: 'state' },
      { countryCode: 'US', code: 'ND', name: 'North Dakota', type: 'state' },
      { countryCode: 'US', code: 'OH', name: 'Ohio', type: 'state' },
      { countryCode: 'US', code: 'OK', name: 'Oklahoma', type: 'state' },
      { countryCode: 'US', code: 'OR', name: 'Oregon', type: 'state' },
      { countryCode: 'US', code: 'PA', name: 'Pennsylvania', type: 'state' },
      { countryCode: 'US', code: 'RI', name: 'Rhode Island', type: 'state' },
      { countryCode: 'US', code: 'SC', name: 'South Carolina', type: 'state' },
      { countryCode: 'US', code: 'SD', name: 'South Dakota', type: 'state' },
      { countryCode: 'US', code: 'TN', name: 'Tennessee', type: 'state' },
      { countryCode: 'US', code: 'TX', name: 'Texas', type: 'state' },
      { countryCode: 'US', code: 'UT', name: 'Utah', type: 'state' },
      { countryCode: 'US', code: 'VT', name: 'Vermont', type: 'state' },
      { countryCode: 'US', code: 'VA', name: 'Virginia', type: 'state' },
      { countryCode: 'US', code: 'WA', name: 'Washington', type: 'state' },
      { countryCode: 'US', code: 'WV', name: 'West Virginia', type: 'state' },
      { countryCode: 'US', code: 'WI', name: 'Wisconsin', type: 'state' },
      { countryCode: 'US', code: 'WY', name: 'Wyoming', type: 'state' },
      { countryCode: 'US', code: 'DC', name: 'District of Columbia', type: 'federal_district' },
    ];

    for (const state of states) {
      await prisma.state.create({
        data: {
          ...state,
          isActive: true
        }
      });
      console.log(`  ✓ Estado/Departamento creado: ${state.name} (${state.countryCode})`);
    }
  }

    async function seedCities() {
    console.log('🏙️ Creando ciudades...');

    // Obtener todos los estados para mapeo rápido
    const allStates = await prisma.state.findMany();
    const stateMap = new Map(
      allStates.map(state => [`${state.countryCode}_${state.code}`, state.id])
    );

    // Ciudades de Perú (todas las provincias capitales y principales)
    const peruCities = [
      // Lima
      { stateCode: 'LIM', name: 'Lima', postalCode: '15001' },
      { stateCode: 'LIM', name: 'Ate', postalCode: '15003' },
      { stateCode: 'LIM', name: 'Barranco', postalCode: '15004' },
      { stateCode: 'LIM', name: 'Breña', postalCode: '15005' },
      { stateCode: 'LIM', name: 'Comas', postalCode: '15006' },
      { stateCode: 'LIM', name: 'Chorrillos', postalCode: '15007' },
      { stateCode: 'LIM', name: 'El Agustino', postalCode: '15008' },
      { stateCode: 'LIM', name: 'Jesús María', postalCode: '15011' },
      { stateCode: 'LIM', name: 'La Molina', postalCode: '15012' },
      { stateCode: 'LIM', name: 'La Victoria', postalCode: '15013' },
      { stateCode: 'LIM', name: 'Lince', postalCode: '15014' },
      { stateCode: 'LIM', name: 'Los Olivos', postalCode: '15015' },
      { stateCode: 'LIM', name: 'Magdalena del Mar', postalCode: '15017' },
      { stateCode: 'LIM', name: 'Miraflores', postalCode: '15018' },
      { stateCode: 'LIM', name: 'Pueblo Libre', postalCode: '15021' },
      { stateCode: 'LIM', name: 'Rímac', postalCode: '15025' },
      { stateCode: 'LIM', name: 'San Isidro', postalCode: '15027' },
      { stateCode: 'LIM', name: 'San Juan de Miraflores', postalCode: '15029' },
      { stateCode: 'LIM', name: 'San Miguel', postalCode: '15030' },
      { stateCode: 'LIM', name: 'Santiago de Surco', postalCode: '15033' },
      { stateCode: 'LIM', name: 'Villa María del Triunfo', postalCode: '15037' },
      
      // Otras ciudades importantes
      { stateCode: 'ARE', name: 'Arequipa', postalCode: '04001' },
      { stateCode: 'ARE', name: 'Cayma', postalCode: '04017' },
      { stateCode: 'CUS', name: 'Cusco', postalCode: '08001' },
      { stateCode: 'CUS', name: 'Machu Picchu', postalCode: '08680' },
      { stateCode: 'PIU', name: 'Piura', postalCode: '20001' },
      { stateCode: 'LAM', name: 'Chiclayo', postalCode: '14001' },
      { stateCode: 'LAL', name: 'Trujillo', postalCode: '13001' },
      { stateCode: 'JUN', name: 'Huancayo', postalCode: '12001' },
      { stateCode: 'HUC', name: 'Huánuco', postalCode: '10001' },
      { stateCode: 'ICA', name: 'Ica', postalCode: '11001' },
      { stateCode: 'PUN', name: 'Puno', postalCode: '21001' },
      { stateCode: 'TAC', name: 'Tacna', postalCode: '23001' },
      { stateCode: 'MOQ', name: 'Moquegua', postalCode: '18001' },
      { stateCode: 'AYA', name: 'Ayacucho', postalCode: '05001' },
      { stateCode: 'CAJ', name: 'Cajamarca', postalCode: '06001' },
      { stateCode: 'HUV', name: 'Huancavelica', postalCode: '09001' },
      { stateCode: 'ANC', name: 'Huaraz', postalCode: '02001' },
      { stateCode: 'APU', name: 'Abancay', postalCode: '03001' },
      { stateCode: 'LOR', name: 'Iquitos', postalCode: '16001' },
      { stateCode: 'MDD', name: 'Puerto Maldonado', postalCode: '17001' },
      { stateCode: 'SAM', name: 'Moyobamba', postalCode: '22001' },
      { stateCode: 'TUM', name: 'Tumbes', postalCode: '24001' },
      { stateCode: 'UCA', name: 'Pucallpa', postalCode: '25001' },
    ];

    // Ciudades de EE.UU. (principales ciudades de cada estado)
    const usCities = [
      // California
      { stateCode: 'CA', name: 'Los Angeles', postalCode: '90001' },
      { stateCode: 'CA', name: 'San Diego', postalCode: '92101' },
      { stateCode: 'CA', name: 'San Jose', postalCode: '95101' },
      { stateCode: 'CA', name: 'San Francisco', postalCode: '94102' },
      { stateCode: 'CA', name: 'Fresno', postalCode: '93650' },
      { stateCode: 'CA', name: 'Sacramento', postalCode: '94203' },
      { stateCode: 'CA', name: 'Long Beach', postalCode: '90802' },
      { stateCode: 'CA', name: 'Oakland', postalCode: '94601' },
      { stateCode: 'CA', name: 'Bakersfield', postalCode: '93301' },
      { stateCode: 'CA', name: 'Anaheim', postalCode: '92801' },
      
      // Texas
      { stateCode: 'TX', name: 'Houston', postalCode: '77001' },
      { stateCode: 'TX', name: 'San Antonio', postalCode: '78201' },
      { stateCode: 'TX', name: 'Dallas', postalCode: '75201' },
      { stateCode: 'TX', name: 'Austin', postalCode: '73301' },
      { stateCode: 'TX', name: 'Fort Worth', postalCode: '76101' },
      { stateCode: 'TX', name: 'El Paso', postalCode: '79901' },
      { stateCode: 'TX', name: 'Arlington', postalCode: '76001' },
      { stateCode: 'TX', name: 'Corpus Christi', postalCode: '78401' },
      { stateCode: 'TX', name: 'Plano', postalCode: '75023' },
      { stateCode: 'TX', name: 'Laredo', postalCode: '78040' },
      
      // Nueva York
      { stateCode: 'NY', name: 'New York', postalCode: '10001' },
      { stateCode: 'NY', name: 'Buffalo', postalCode: '14201' },
      { stateCode: 'NY', name: 'Rochester', postalCode: '14602' },
      { stateCode: 'NY', name: 'Yonkers', postalCode: '10701' },
      { stateCode: 'NY', name: 'Syracuse', postalCode: '13201' },
      { stateCode: 'NY', name: 'Albany', postalCode: '12201' },
      { stateCode: 'NY', name: 'New Rochelle', postalCode: '10801' },
      
      // Florida
      { stateCode: 'FL', name: 'Jacksonville', postalCode: '32099' },
      { stateCode: 'FL', name: 'Miami', postalCode: '33101' },
      { stateCode: 'FL', name: 'Tampa', postalCode: '33601' },
      { stateCode: 'FL', name: 'Orlando', postalCode: '32801' },
      { stateCode: 'FL', name: 'St. Petersburg', postalCode: '33701' },
      { stateCode: 'FL', name: 'Hialeah', postalCode: '33002' },
      { stateCode: 'FL', name: 'Tallahassee', postalCode: '32301' },
      
      // Illinois
      { stateCode: 'IL', name: 'Chicago', postalCode: '60601' },
      { stateCode: 'IL', name: 'Aurora', postalCode: '60502' },
      { stateCode: 'IL', name: 'Rockford', postalCode: '61101' },
      { stateCode: 'IL', name: 'Joliet', postalCode: '60431' },
      { stateCode: 'IL', name: 'Naperville', postalCode: '60540' },
      
      // Pennsylvania
      { stateCode: 'PA', name: 'Philadelphia', postalCode: '19019' },
      { stateCode: 'PA', name: 'Pittsburgh', postalCode: '15201' },
      { stateCode: 'PA', name: 'Allentown', postalCode: '18101' },
      { stateCode: 'PA', name: 'Erie', postalCode: '16501' },
      
      // Ohio
      { stateCode: 'OH', name: 'Columbus', postalCode: '43085' },
      { stateCode: 'OH', name: 'Cleveland', postalCode: '44101' },
      { stateCode: 'OH', name: 'Cincinnati', postalCode: '45201' },
      { stateCode: 'OH', name: 'Toledo', postalCode: '43601' },
      
      // Georgia
      { stateCode: 'GA', name: 'Atlanta', postalCode: '30301' },
      { stateCode: 'GA', name: 'Augusta', postalCode: '30901' },
      { stateCode: 'GA', name: 'Columbus', postalCode: '31901' },
      
      // Michigan
      { stateCode: 'MI', name: 'Detroit', postalCode: '48201' },
      { stateCode: 'MI', name: 'Grand Rapids', postalCode: '49501' },
      { stateCode: 'MI', name: 'Warren', postalCode: '48088' },
      
      // Nueva Jersey
      { stateCode: 'NJ', name: 'Newark', postalCode: '07101' },
      { stateCode: 'NJ', name: 'Jersey City', postalCode: '07302' },
      { stateCode: 'NJ', name: 'Paterson', postalCode: '07501' },
    ];

    // Insertar ciudades de Perú
    for (const city of peruCities) {
      const stateId = stateMap.get(`PE_${city.stateCode}`);
      if (stateId) {
        await prisma.city.create({
          data: {
            name: city.name,
            postalCode: city.postalCode,
            isActive: true,
            stateId: stateId
          }
        });
        console.log(`  ✓ Ciudad peruana creada: ${city.name}, ${city.stateCode}`);
      }
    }

    // Insertar ciudades de EE.UU.
    for (const city of usCities) {
      const stateId = stateMap.get(`US_${city.stateCode}`);
      if (stateId) {
        await prisma.city.create({
          data: {
            name: city.name,
            postalCode: city.postalCode,
            isActive: true,
            stateId: stateId
          }
        });
        console.log(`  ✓ Ciudad estadounidense creada: ${city.name}, ${city.stateCode}`);
      }
    }
  }

 
seedGeographicData().catch((e) => {
  console.error(e)
  process.exit(1)
})
