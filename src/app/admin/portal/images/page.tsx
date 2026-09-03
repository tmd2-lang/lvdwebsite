import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getClients } from "@/lib/client-data";
import { getImages, withSignedUrls } from "@/lib/image-data";
import type { ViewableImage } from "@/lib/image-view";
import styles from "../portal-admin.module.css";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) redirect("/api/admin/auth/refresh?next=/admin/portal/images");
    redirect("/admin/login");
  }

  // A missing table means the schema file has not been run yet. That is a
  // setup step, not an empty library, so the page says which one it is.
  const [library, clients] = await Promise.all([
    getImages()
      .then(withSignedUrls)
      .then((rows) => ({ rows, setupNeeded: "" }))
      .catch((error: unknown) => ({
        rows: [] as ViewableImage[],
        setupNeeded: error instanceof Error ? error.message : "",
      })),
    getClients().catch(() => []),
  ]);
  const { rows: images, setupNeeded } = library;

  const nameFor = new Map(clients.map((client) => [client.id, client.display_name]));

  return (
    <main className={styles.libraryPage}>
      <header className={styles.libraryHeader}>
        <div>
          <p className={styles.eyebrow}>Image administration</p>
          <h1>Images</h1>
          <p>Client inspiration, design references, and event galleries across every celebration.</p>
        </div>
        <Link className={styles.newClientAction} href="/admin/portal/clients">Choose a client</Link>
      </header>

      {setupNeeded ? (
        <section className={styles.libraryEmpty}>
          <span aria-hidden="true">！</span>
          <div>
            <p className={styles.eyebrow}>Setup unfinished</p>
            <h2>Image storage is not connected yet.</h2>
            <p>{setupNeeded}</p>
          </div>
        </section>
      ) : images.length === 0 ? (
        <section className={styles.libraryEmpty}>
          <span aria-hidden="true">03</span>
          <div>
            <p className={styles.eyebrow}>Nothing here yet</p>
            <h2>No client images have been added.</h2>
            <p>Open a client and use their Images tab to upload the first board.</p>
          </div>
          <Link href="/admin/portal/clients">View clients <span aria-hidden="true">→</span></Link>
        </section>
      ) : (
        <ul className={styles.imageGrid}>
          {images.map((image) => (
            <li key={image.id} className={image.visible_to_client ? undefined : styles.imageHidden}>
              <Link href={`/admin/portal/clients/${image.client_id}?tab=images`}>
                <figure>
                  {image.url ? (
                    // Signed storage links expire, so Next's optimiser cannot cache these.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={image.name} loading="lazy" width={image.width || undefined} height={image.height || undefined} />
                  ) : (
                    <div className={styles.imageMissing}>Preview unavailable</div>
                  )}
                  <figcaption>
                    <strong title={image.name}>{nameFor.get(image.client_id) || "Unknown client"}</strong>
                    <small>{image.album} · {image.name}</small>
                  </figcaption>
                </figure>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
