"use client";

import * as React from "react";
import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Image,
  Input,
  Kbd,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Pagination,
  Select,
  SelectItem,
  Skeleton,
  Spacer,
  Switch,
  useDisclosure,
} from "@heroui/react";

type CharacterStatus = "Alive" | "Dead" | "unknown";
type CharacterGender = "Female" | "Male" | "Genderless" | "unknown";

type Character = {
  id: string;
  name: string;
  image: string;
  status: CharacterStatus;
  species: string;
  gender: CharacterGender;
  origin: { name: string } | null;
  location: { name: string } | null;
};

type CharactersQueryData = {
  characters: {
    info: { count: number; pages: number; next: number | null; prev: number | null };
    results: Character[];
  } | null;
};

type CharactersQueryVars = {
  page?: number;
  filter?: {
    name?: string;
    status?: CharacterStatus;
    species?: string;
    gender?: CharacterGender;
  };
};

const GET_CHARACTERS = gql`
  query Characters($page: Int, $filter: FilterCharacter) {
    characters(page: $page, filter: $filter) {
      info {
        count
        pages
        next
        prev
      }
      results {
        id
        name
        image
        status
        species
        gender
        origin {
          name
        }
        location {
          name
        }
      }
    }
  }
`;

function statusChipColor(status: CharacterStatus): "success" | "danger" | "default" {
  if (status === "Alive") return "success";
  if (status === "Dead") return "danger";
  return "default";
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function CharacterBrowser() {
  const [page, setPage] = React.useState(1);
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState<CharacterStatus | "">("");
  const [gender, setGender] = React.useState<CharacterGender | "">("");
  const [species, setSpecies] = React.useState("");
  const [isDark, setIsDark] = React.useState(false);

  const debouncedName = useDebouncedValue(name, 350);
  const debouncedSpecies = useDebouncedValue(species, 350);

  React.useEffect(() => {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const nextIsDark = document.documentElement.classList.contains("dark") || prefersDark;
    setIsDark(nextIsDark);
    if (nextIsDark) document.documentElement.classList.add("dark");
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedName, status, gender, debouncedSpecies]);

  const filter: CharactersQueryVars["filter"] = React.useMemo(() => {
    const f: NonNullable<CharactersQueryVars["filter"]> = {};
    if (debouncedName.trim()) f.name = debouncedName.trim();
    if (status) f.status = status;
    if (gender) f.gender = gender;
    if (debouncedSpecies.trim()) f.species = debouncedSpecies.trim();
    return Object.keys(f).length ? f : undefined;
  }, [debouncedName, status, gender, debouncedSpecies]);

  const { data, loading, error } = useQuery<CharactersQueryData, CharactersQueryVars>(GET_CHARACTERS, {
    variables: { page: Math.max(1, page - 1), filter },
    notifyOnNetworkStatusChange: true,
  });

  const characters = data?.characters?.results ?? [];
  const pages = data?.characters?.info.pages ?? 0;
  const hasResults = characters.length > 0;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = React.useState<Character | null>(null);

  const openDetails = React.useCallback(
    (c: Character) => {
      setSelected(c);
      onOpen();
    },
    [onOpen],
  );

  const clearFilters = React.useCallback(() => {
    setName("");
    setStatus("");
    setGender("");
    setSpecies("");
    setPage(1);
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar maxWidth="xl" position="sticky" className="border-b border-default-100/60">
        <NavbarBrand className="gap-2">
          <div className="h-8 w-8 rounded-xl bg-linear-to-br from-primary to-secondary" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Rick & Morty</span>
            <span className="text-xs text-foreground-500">Character Browser</span>
          </div>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <Switch
              size="sm"
              isSelected={isDark}
              onValueChange={setIsDark}
              aria-label="Toggle dark mode"
            >
              Dark
            </Switch>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4">
          {/* Hero header card */}
          <Card className="border border-default-100/60" isHoverable>
            <CardBody className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-linear-to-br from-primary/30 to-secondary/30 blur-3xl" />
              <div className="pointer-events-none absolute -left-24 -bottom-28 h-72 w-72 rounded-full bg-linear-to-br from-success/20 to-warning/20 blur-3xl" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="text-2xl font-semibold tracking-tight">Browse characters</div>
                  <div className="text-sm text-foreground-500">
                    Search and filter across the Rick &amp; Morty universe.
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip variant="flat" color="primary">
                    GraphQL + Apollo
                  </Chip>
                  <Chip variant="flat">HeroUI</Chip>
                  <Chip variant="flat" className="font-mono">
                    page {page}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Filters + summary card */}
          <Card className="border border-default-100/60">
            <CardHeader className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <div className="text-sm font-semibold">Filters</div>
                <div className="text-xs text-foreground-500">Tip: typing is debounced for smoother searching.</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="flat" onPress={clearFilters} isDisabled={!name && !status && !gender && !species}>
                  Clear
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    setPage(1);
                  }}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <Input
                  label="Search"
                  placeholder="Try 'Rick'…"
                  value={name}
                  onValueChange={setName}
                  className="md:flex-1"
                  endContent={<Kbd keys={["command"]}>K</Kbd>}
                />

                <Input
                  label="Species"
                  placeholder="Human, Alien…"
                  value={species}
                  onValueChange={setSpecies}
                  className="md:w-64"
                />

                <Select
                  label="Status"
                  selectedKeys={status ? [status] : []}
                  onSelectionChange={(keys) => {
                    const first = Array.from(keys)[0] as CharacterStatus | undefined;
                    setStatus(first ?? "");
                  }}
                  className="md:w-56"
                >
                  {(["Alive", "Dead", "unknown"] as const).map((s) => (
                    <SelectItem key={s}>{s}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Gender"
                  selectedKeys={gender ? [gender] : []}
                  onSelectionChange={(keys) => {
                    const first = Array.from(keys)[0] as CharacterGender | undefined;
                    setGender(first ?? "");
                  }}
                  className="md:w-56"
                >
                  {(["Female", "Male", "Genderless", "unknown"] as const).map((g) => (
                    <SelectItem key={g}>{g}</SelectItem>
                  ))}
                </Select>
              </div>
            </CardBody>
            <Divider />
            <CardFooter className="justify-between">
              <div className="text-sm text-foreground-500">
                {loading ? (
                  "Loading…"
                ) : (
                  <>
                    Showing <span className="text-foreground font-medium">{characters.length}</span>{" "}
                    {characters.length === 1 ? "character" : "characters"}
                    {data?.characters?.info.count != null ? (
                      <>
                        {" "}
                        of <span className="text-foreground font-medium">{data.characters.info.count}</span>
                      </>
                    ) : null}
                  </>
                )}
              </div>
              <div className="text-xs text-foreground-400">Powered by Rick &amp; Morty API</div>
            </CardFooter>
          </Card>

          {error ? (
            <Alert color="danger" title="Something went wrong">
              {error.message}
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-4">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <Card
                    key={i}
                    className="w-full border border-default-100/60"
                    isHoverable
                  >
                    <CardHeader className="gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex w-full flex-col gap-2">
                        <Skeleton className="h-4 w-3/4 rounded-lg" />
                        <Skeleton className="h-3 w-1/2 rounded-lg" />
                      </div>
                    </CardHeader>
                    <CardBody>
                      <Skeleton className="aspect-16/10 w-full rounded-xl" />
                    </CardBody>
                    <CardFooter>
                      <Skeleton className="h-9 w-24 rounded-xl" />
                    </CardFooter>
                  </Card>
                ))
              : characters.map((c) => (
                  <Card
                    key={c.id}
                    className="w-full border border-default-100/60"
                    isPressable
                    isHoverable
                    isFooterBlurred
                    onPress={() => openDetails(c)}
                  >
                    <CardHeader className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold">{c.name}</div>
                        <div className="text-sm text-foreground-500">
                          {c.species} • {c.gender}
                        </div>
                      </div>
                      <Chip size="sm" color={statusChipColor(c.status)} variant="flat">
                        {c.status}
                      </Chip>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <Image
                        alt={c.name}
                        src={c.image}
                        className="aspect-16/10 w-full rounded-xl object-cover"
                        isZoomed
                      />
                      <Spacer y={3} />
                      <div className="text-sm text-foreground-500">
                        <div className="truncate">
                          <span className="text-foreground-700">Origin:</span> {c.origin?.name ?? "Unknown"}
                        </div>
                        <div className="truncate">
                          <span className="text-foreground-700">Location:</span> {c.location?.name ?? "Unknown"}
                        </div>
                      </div>
                    </CardBody>
                    <CardFooter className="justify-between bg-background/60 backdrop-blur-md">
                      <div className="text-xs text-foreground-500">
                        <span className="font-medium text-foreground-700">Origin:</span> {c.origin?.name ?? "Unknown"}
                      </div>
                      <Button size="sm" variant="flat">
                        Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
          </div>

          {!loading && !hasResults ? (
            <Card className="border border-default-100/60">
              <CardBody className="items-center py-10 text-center">
                <div className="text-lg font-semibold">No results</div>
                <div className="mt-1 text-sm text-foreground-500">
                  Try changing the filters and searching again.
                </div>
                <Spacer y={4} />
                <Button color="primary" onPress={clearFilters}>
                  Reset filters
                </Button>
              </CardBody>
            </Card>
          ) : null}

          <Card className="border border-default-100/60">
            <CardBody className="flex items-center justify-center py-4">
              <Pagination
                page={page}
                total={Math.max(pages, 1)}
                onChange={setPage}
                isDisabled={loading || pages <= 1}
                showControls
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" backdrop="blur">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{selected?.name ?? "Character"}</ModalHeader>
              <ModalBody>
                {selected ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_1fr]">
                    <Image
                      alt={selected.name}
                      src={selected.image}
                      className="w-full rounded-2xl object-cover"
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Chip size="sm" color={statusChipColor(selected.status)} variant="flat">
                          {selected.status}
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {selected.species}
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {selected.gender}
                        </Chip>
                      </div>
                      <Divider className="my-1" />
                      <div className="text-sm">
                        <div className="text-foreground-500">Origin</div>
                        <div className="font-medium">{selected.origin?.name ?? "Unknown"}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-foreground-500">Last known location</div>
                        <div className="font-medium">{selected.location?.name ?? "Unknown"}</div>
                      </div>
                      <div className="text-xs text-foreground-500">
                        ID: <span className="font-mono">{selected.id}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={() => close()}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}


