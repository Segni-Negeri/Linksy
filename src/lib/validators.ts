export function validateCreateLink(body: any) {
  const errors: string[] = [];
  if (!body) errors.push('Missing body');
  const slug = body?.slug;
  const destination = body?.destination;
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]{3,50}$/i.test(slug)) {
    errors.push('Invalid slug');
  }
  try {
    new URL(destination);
  } catch {
    errors.push('Invalid destination URL');
  }
  return { valid: errors.length === 0, errors };
}

export function validateUpdateLink(body: any) {
  const errors: string[] = [];
  if (!body) errors.push('Missing body');
  if (body?.destination) {
    try { new URL(body.destination); } catch { errors.push('Invalid destination URL'); }
  }
  return { valid: errors.length === 0, errors };
}

export function validateCreateTask(body: any) {
  const errors: string[] = [];
  const { type, label, target } = body || {};
  if (!type || typeof type !== 'string') errors.push('Missing type');
  if (!label || typeof label !== 'string') errors.push('Missing label');
  if (target && typeof target !== 'string') errors.push('Invalid target');
  return { valid: errors.length === 0, errors };
}

export function validateVisit(body: any) {
  const errors: string[] = [];
  if (!body?.link_id || typeof body.link_id !== 'string') errors.push('Missing link_id');
  return { valid: errors.length === 0, errors };
}

export function validateCompletion(body: any) {
  const errors: string[] = [];
  if (!body?.visit_id || typeof body.visit_id !== 'string') errors.push('Missing visit_id');
  const allowed = ['pending', 'success', 'failed'];
  if (body?.status && !allowed.includes(body.status)) errors.push('Invalid status');
  return { valid: errors.length === 0, errors };
}
