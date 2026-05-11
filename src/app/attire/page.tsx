'use client';

import { Container, SectionHeader, Card } from '@/components';
import { attireSections } from '@/lib/mockData';

export default function AttirePage() {
  return (
    <section className="pt-24 pb-16">
      <Container size="md">
        <SectionHeader
          title="Attire"
          subtitle="What to wear to our celebration"
        />

        {/* Cultural Attire Callout */}
        <Card className="mb-12 border-l-4 border-l-[#D6C6E1] bg-gradient-to-r from-[#D6C6E1]/10 to-transparent">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-[#D6C6E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-fg mb-2">Celebrating Our Cultures</h3>
              <p className="text-muted">
                This celebration brings together many cultures, and that means the world to us. We highly encourage traditional or cultural attire from any background — it&apos;s part of what will make this day so special.
              </p>
            </div>
          </div>
        </Card>

        {/* Suggested Color Palette */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-fg mb-3">Suggested Color Palette</h3>
          <p className="text-muted mb-6">
            If you'd like some color inspiration, here are the light pastels we're incorporating into our celebration. These are just suggestions—wear what makes you feel your best!
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {[
              { name: 'Sky Blue', hex: '#CFE8F7' },
              { name: 'Butter Yellow', hex: '#F6E7B2' },
              { name: 'Soft Peach', hex: '#F7D6C1' },
              { name: 'Soft Lavender', hex: '#D6C6E1' },
              { name: 'Sage Green', hex: '#BFCBB2' },
            ].map((color) => (
              <div key={color.name} className="flex flex-col items-center">
                <div
                  className="w-full aspect-square rounded-lg shadow-sm border border-black/5"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="mt-2 text-sm text-muted text-center">{color.name}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted italic">
            Note: These colors are suggestions to help with coordination, not requirements. Please don't feel obligated—we simply want you to enjoy celebrating with us.
          </p>
        </div>

        <div className="space-y-12">
          {attireSections.map((section) => (
            <div key={section.id}>
              <h3 className="text-xl font-semibold text-fg mb-4">{section.title}</h3>
              <p className="text-muted mb-6">{section.description}</p>

              {/* Image tiles */}
              {section.images.length > 0 && (
                <div className="hidden sm:grid grid-cols-2 gap-4 mb-6">
                  {section.images.map((image, index) =>
                    image.startsWith('/') ? (
                      <img
                        key={index}
                        src={image}
                        alt={index === 0 ? 'Do' : 'Avoid'}
                        className="aspect-[4/3] rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        key={index}
                        className="aspect-[4/3] rounded-lg"
                        style={{ background: image }}
                      />
                    )
                  )}
                </div>
              )}

              {/* Do / Avoid lists */}
              {(section.doList.length > 0 || section.avoidList.length > 0) && (
                <div className="hidden sm:grid sm:grid-cols-2 gap-6">
                  <Card>
                    <h4 className="font-semibold text-fg mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Do
                    </h4>
                    <ul className="space-y-2">
                      {section.doList.map((item, index) => (
                        <li key={index} className="text-sm text-muted flex gap-2">
                          <span className="text-green-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card>
                    <h4 className="font-semibold text-fg mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Avoid
                    </h4>
                    <ul className="space-y-2">
                      {section.avoidList.map((item, index) => (
                        <li key={index} className="text-sm text-muted flex gap-2">
                          <span className="text-red-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Mobile: pair image with list */}
              <div className="sm:hidden space-y-6">
                {section.images[0] && (
                  <div className="space-y-4">
                    {section.images[0].startsWith('/') ? (
                      <img
                        src={section.images[0]}
                        alt="Do"
                        className="aspect-[4/3] rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="aspect-[4/3] rounded-lg"
                        style={{ background: section.images[0] }}
                      />
                    )}
                    {section.doList.length > 0 && (
                      <Card>
                        <h4 className="font-semibold text-fg mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Do
                        </h4>
                        <ul className="space-y-2">
                          {section.doList.map((item, index) => (
                            <li key={index} className="text-sm text-muted flex gap-2">
                              <span className="text-green-500">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                )}

                {section.images[1] && (
                  <div className="space-y-4">
                    {section.images[1].startsWith('/') ? (
                      <img
                        src={section.images[1]}
                        alt="Avoid"
                        className="aspect-[4/3] rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="aspect-[4/3] rounded-lg"
                        style={{ background: section.images[1] }}
                      />
                    )}
                    {section.avoidList.length > 0 && (
                      <Card>
                        <h4 className="font-semibold text-fg mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Avoid
                        </h4>
                        <ul className="space-y-2">
                          {section.avoidList.map((item, index) => (
                            <li key={index} className="text-sm text-muted flex gap-2">
                              <span className="text-red-500">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
