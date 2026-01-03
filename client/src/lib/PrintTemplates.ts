import { ShipmentData } from '@/types/shipment';
import { format } from 'date-fns';

const formatDate = (dateString: string) => {
  if (!dateString) return '_________________';
  return format(new Date(dateString), 'dd-MMM-yyyy').toUpperCase();
};

export const printDeclaration = (data: ShipmentData) => {
  return `
    <html>
    <head>
      <title>Declaration - ${data.id}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 250px 40px 50px 40px; line-height: 1.6; max-width: 850px; margin: 0 auto; margin-top: 100px; }
        .date { text-align: right; margin-bottom: 100px; font-size: 12pt; }
        .spacer-before { height: 20px; }
        h1 { text-align: center; text-decoration: underline; margin: 20px 0; font-size: 16pt; letter-spacing: 1px; }
        .declaration-text { text-align: justify; margin: 30px 0; line-height: 1.7; font-size: 11pt; }
        .details-section { margin-top: 40px; margin-bottom: 60px; }
        .detail-line { margin: 8px 0; font-size: 11pt; }
        .company-name { text-align: left; margin-top: 100px; font-size: 12pt; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="date">${formatDate(data.details.inspectionDate || new Date().toISOString())}</div>
      <div class="spacer-before"></div>
      
      <h1>DECLARATION</h1>
      
      <div class="declaration-text">
        We undertake that we import ${data.details.brand || 'used clothing'} from USA, inspected by SGS Pakistan, export to ${data.details.consignee || 'M/s Safqa Limited'}, Mombasa, Kenya vide
      </div>
      
      <div class="details-section">
        <div class="detail-line">IDF# ${data.details.idf || '_________________'},</div>
        <div class="detail-line">UCR # ${data.details.ucr || '_________________'}</div>
        <div class="detail-line">PFI# : ${data.details.proforma || '_________________'}</div>
        <div class="detail-line">CNTR# ${data.details.container || '_________________'}</div>
      </div>
      
      <div class="company-name">
        IDEAS RECYCLING PVT LTD
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;
};

export const printUndertaking = (data: ShipmentData) => {
  return `
    <html>
    <head>
      <title>Undertaking - ${data.id}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 250px 40px 50px 40px; line-height: 1.6; max-width: 850px; margin: 0 auto; margin-top: 100px; }
        .date { text-align: right; margin-bottom: 80px; font-size: 12pt; }
        h1 { text-align: center; text-decoration: underline; margin: 40px 0; font-size: 16pt; letter-spacing: 1px; }
        .content { text-align: justify; margin: 30px 0; line-height: 1.7; font-size: 11pt; }
        .details { margin: 30px 0; line-height: 1.8; }
        .footer { margin-top: 80px; text-align: left; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="date">${formatDate(data.details.inspectionDate || new Date().toISOString())}</div>
      
      <h1>UNDERTAKING OF USED CLOTHING</h1>
      
      <div class="content">
        We hereby undertake that the used clothing imported from USA, inspected by SGS Pakistan, export to ${data.details.consignee || 'M/s Safqa Limited'}, Mombasa, Kenya vide
      </div>

      <div class="details">
        IDF# ${data.details.idf || '_________________'},<br/>
        UCR # ${data.details.ucr || '_________________'}<br/>
        PFI# : ${data.details.proforma || '_________________'}<br/>
        CNTR# ${data.details.container || '_________________'}
      </div>

      <div class="footer">
        IDEAS RECYCLING PVT LTD
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;
};

export const printShoesUndertaking = (data: ShipmentData) => {
  return `
    <html>
    <head>
      <title>Shoes Undertaking - ${data.id}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 250px 40px 50px 40px; line-height: 1.6; max-width: 850px; margin: 0 auto; margin-top: 100px; }
        .date { text-align: right; margin-bottom: 80px; font-size: 12pt; }
        h1 { text-align: center; text-decoration: underline; margin: 40px 0; font-size: 16pt; letter-spacing: 1px; }
        .content { text-align: justify; margin: 30px 0; line-height: 1.7; font-size: 11pt; }
        .details { margin: 30px 0; line-height: 1.8; }
        .footer { margin-top: 80px; text-align: left; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="date">${formatDate(data.details.inspectionDate || new Date().toISOString())}</div>
      
      <h1>UNDERTAKING OF SHOES</h1>
      
      <div class="content">
        We hereby undertake that the used shoes imported from USA, inspected by SGS Pakistan, export to ${data.details.consignee || 'M/s Safqa Limited'}, Mombasa, Kenya vide
      </div>

      <div class="details">
        IDF# ${data.details.idf || '_________________'},<br/>
        UCR # ${data.details.ucr || '_________________'}<br/>
        PFI# : ${data.details.proforma || '_________________'}<br/>
        CNTR# ${data.details.container || '_________________'}
      </div>

      <div class="footer">
        IDEAS RECYCLING PVT LTD
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;
};
